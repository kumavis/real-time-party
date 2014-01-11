hrtime = process.hrtime || require('./hrtime.js')

function runTest() {
  var time = hrtime()
  setTimeout(function() {
    var diff = hrtime(time)
    // benchmark took 1234000000 nanoseconds
    console.log('benchmark took %d nanoseconds', diff[0] * 1e9 + diff[1])
    console.log(diff)
    runTest()
  }, 1234)
}

runTest()