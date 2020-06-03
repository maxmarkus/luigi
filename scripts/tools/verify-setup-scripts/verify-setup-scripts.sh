#!/usr/bin/env bash

###
#
# Usage:
# ./verify-setup-scripts.sh
# ./verify-setup-scripts.sh [index]
#
# Run specific testcase by index 0 - N
# ./verify-setup-scripts.sh [index]
#
###

set -e # exit on errors
base_dir="$( cd "$(dirname "$0")" ; pwd -P )"
source $base_dir/../../shared/bashHelpers.sh

tmp_dir="/tmp/setuptests" # it is repeated on line 19
setup_dir=$base_dir/../../../scripts/setup
testcases_json=`cat ${base_dir}/setup-testcases.json`
testcases_length=`echo $testcases_json | jq '. | length'`

testcase_index="$1"

echoe "Testcases found: $testcases_length"

if [ -d "$tmp_dir" ]; then
  echoe "Start with a fresh temp dir in: $tmp_dir"
  # For sake of security, not using a variable here.
  rm -rf /tmp/setuptests/*
else
  echoe "Creating temp dir: $tmp_dir"
  mkdir -p $tmp_dir
fi


declare -a pids

killpids() {
  for pid in "${pids[@]}"; do
    # ps -p returns a header line and then the processes, so we count the lines with wc -l
    # if there is more than 1 line, the process exists
    if [ `ps -p $pid | wc -l` -gt 1 ]; then
      echo "Killing $pid"
      kill -9 $pid
    fi
  done
}

lastRunComplete=1

for ((i=0; i<$testcases_length; i++)); do
  _jq() {
    # grabs a value by key from the current element
    echo ${testcases_json} | jq -r ".[${i}]${1} // empty"
  }

  # Run only specific testcase if param is set
  if [ ! $testcase_index == "" ] && [ ! $testcase_index == $i ]; then
    continue
  fi

  # If previous run failed and not running specific testcase
  if [ $lastRunComplete == 0 ] && [ $testcase_index == "" ]; then
    echoe "Previous install (${($i-1)}) did not complete."
    exit 1;
  fi
  lastRunComplete=0

  
  test_folder="setup${i}"
  test_name=$(_jq '.name')
  test_script=$(_jq '.script')
  test_baseurl=$(_jq '.baseurl')
  test_visitprefix=$(_jq '.visitprefix')
  test_healthyurl=$(_jq '.healthyurl')
  test_waitafterhealthy=$(_jq '.waitafterhealthy')
  test_webserverport=$(_jq '.webserverport')

  killWebserver $test_webserverport

  cd $tmp_dir
  echoe "Running installation for ${test_name}"
  $setup_dir/$test_script $test_folder &
  pid=$!
  pids+=($pid)
  echoe "Install pid: $pid"

  {
    echo "Testing $test_healthyurl"
    waitForServer $test_healthyurl 200
  } || {
    echo "waitForServer failed for $test_name"
    killpids
    killWebserver $test_webserverport
    exit 1
  }

  echo "Sleeping for $test_waitafterhealthy"
  sleep $test_waitafterhealthy # server is online a bit earlier most of the time (eg. with npm start)
  cd $base_dir/e2e
  {
    echo "Running: CYPRESS_INITWAITTIME=$test_initwaittime CYPRESS_VISITPREFIX="$test_visitprefix" $setup_dir/../node_modules/.bin/cypress run --browser chrome --config baseUrl=$test_baseurl"
    CYPRESS_VISITPREFIX="$test_visitprefix" $setup_dir/../node_modules/.bin/cypress run --browser chrome --config baseUrl=$test_baseurl
  } || {
    echoe "E2E failed for $test_name"
    killpids
    killWebserver $test_webserverport
    exit 1
  }

  echoe "Tear down"
  killpids
  killWebserver $test_webserverport

  if [ -d "${tmp_dir}/${test_folder}" ]; then
    echoe "Removing testfolder ${test_folder}"
    rm -rf ${tmp_dir}/${test_folder}
  fi
  echoe "Successfully tested ${test_name}"
  lastRunComplete=1
done

echoe "All setups tested successfully"