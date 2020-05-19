#!/usr/bin/env bash

set -e # exit on errors
base_dir="$( cd "$(dirname "$0")" ; pwd -P )"

source $base_dir/../../shared/bashHelpers.sh

tmp_dir="/tmp/setuptests" # it is repeated on line 19
setup_dir=$base_dir/../../../scripts/setup

testcases_json=`cat ${base_dir}/setup-testcases.json`
testcases_length=`echo $testcases_json | jq '. | length'`

echoe "Testcases found: $testcases_length"
if [ ! -d $tmp_dir ]; then
  echoe "Creating temp dir: $tmp_dir"
  mkdir -p $tmp_dir
else
  echoe "Start with a fresh temp dir in: $tmp_dir"
  # For sake of security, not using a variable here.
  rm -rf "/tmp/setuptests/*"
fi

declare -a pids

killpids() {
  for pid in pids[@]; do
    echo "Killing $pid"
    kill -9 $pid
  done
}

for ((i=0; i<$testcases_length; i++)); do
  if [ $i -gt 0 ]; then
    echoe "Should run only after first successful stetup"
    exit 0
  fi
  _jq() {
    # grabs a value by key from the current element
    echo ${testcases_json} | jq -r ".[${i}]${1}"
  }
  
  test_folder="setup${i}"
  test_name=$(_jq '.name')
  test_script=$(_jq '.script')
  test_baseurl=$(_jq '.baseurl')
  test_healthyurl=$(_jq '.healthyurl')
  test_waitafterhealthy=$(_jq '.waitafterhealthy')
  
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
    killpids
  }

  echo "Sleeping for $test_waitafterhealthy"
  sleep $test_waitafterhealthy # server is online a bit earlier most of the time (eg. with npm start)
  cd $base_dir/e2e
  {
    $setup_dir/../node_modules/.bin/cypress run --config baseUrl=$test_baseurl
  } || {
    echoe "E2E exception: @ $__EXCEPTION_LINE__"
    killpids
  }

  if [ -d "${tmp_dir}/${test_folder}" ]; then
    rm -rf ${tmp_dir}/${test_folder}
  fi
  killpids
  echoe "Successfully tested ${test_name}"
done
