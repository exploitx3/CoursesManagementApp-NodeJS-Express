'use strict'
const request = require('request-promise')
const qs = require('qs')
const fs = require('fs')


const werckerConfig = {
  apiUrl: 'https://app.wercker.com',
  token: 'e4a601d7500eaf85d7ba15caa73799db21cb2ab7aaf3d514b9b4f9c3489860d3',
  reportFile: process.env.WERCKER_REPORT_MESSAGE_FILE,
  executedInWercker: process.env.WERCKER || false
}

const createBranchPipelineIds = {
  pipeline: '5a8c907557a1d8010046d567',
  secondPipeline: '5a8c907557a1d8010046d567'

}

const sourcePipelineBuildIds = {
  pipeline: '5a24a10528670b01003f5e0b',
  secondPipeline: '5a24a10528670b01003f5e0b'

}

getAllLastBuildsOnBranch(sourcePipelineBuildIds, 'master', werckerConfig)
.then(lastBuilds => {
  return triggerCreateReleaseBranchPipelines(werckerConfig, createBranchPipelineIds, lastBuilds)
})
.then(function (triggeredPipelines) {
  let timer = null
  timer = setInterval(function () {
    return getStatusForRunningPipelines(werckerConfig, triggeredPipelines)
    .then(all => {
      let statusMessage = []
      let categoriesLength = 20 || 10
      let categoryMessage = `Name ${' '.repeat(categoriesLength - 5)}|Status ${' '.repeat(categoriesLength - 7)}|Result ${' '.repeat(categoriesLength - 7)}|Message ${' '.repeat(categoriesLength - 8)}|Progress ${' '.repeat(categoriesLength - 9)}|`

      all.forEach(status => {
        statusMessage.push(`${formatString(status.name, categoriesLength)}|${formatString(status.status, categoriesLength)}|${formatString(status.result, categoriesLength)}|${formatString(status.message, categoriesLength)}|${formatString(status.progress, categoriesLength)}|`)
      })

      clearConsole(werckerConfig)
      console.log(categoryMessage)
      console.log(statusMessage.join('\n'))

      return all
    })
    .then(allStatuses => {
      if (
        allStatuses.every((status) => status.status === 'finished')
      ) {
        clearInterval(timer)
      }
    })
  }, 1000)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})


function getStatusForPipeline(werckerConfig, pipelineName, pipelineId) {
  let resultPromise = request.get(
    {
      url: werckerConfig.apiUrl + '/api/v3/runs/' + pipelineId,
      json: true,
      resolveWithFullResponse: true,
      headers: {
        Authorization: 'Bearer ' + werckerConfig.token
      }
    }
  )
  .then((res) => {
    const pipelineStatus = {
      name: pipelineName,
      status: res.body.status,
      result: res.body.result,
      message: res.body.message,
      progress: res.body.progress
    }

    return pipelineStatus
  })

  return resultPromise
}

function formatString(str, formatLength) {
  str = new String(str).trim()
  if (str.length >= formatLength) {
    return str.slice(0, formatLength)
  } else {
    while (str.length !== formatLength) {
      str += ' '
    }
    return str
  }
}


function getStatusForRunningPipelines(werckerConfig, runningPipelines) {
  const pipelinesStatus = {}

  const promises = []
  Object.entries(runningPipelines).forEach(([pipelineName, pipelineId]) => {
    const pipelineResult = getStatusForPipeline(werckerConfig, pipelineName, pipelineId)

    promises.push(pipelineResult)
  })

  return Promise.all(promises)
}

function clearConsole(werckerConfig) {
  if (werckerConfig.executedInWercker) {
    fs.writeFileSync(werckerConfig.reportFile, '', {encoding: 'utf8', flag: 'w'})
  } else {
    process.stdout.write('\u001B[2J\u001B[0;0f')
  }
}

function triggerCreateReleaseBranchPipelines(werckerConfig, createBranchPipelineIds, lastDevelopBuilds) {
  let startedPipelineIds = {}

  let promisee = Promise.resolve()

  let keys = Object.keys(createBranchPipelineIds)

  for (let i = 0; i < keys.length; i++) {
    let pipelineName = keys[i]
    let pipelineId = createBranchPipelineIds[keys[i]]
    promisee = promisee.then(function () {
      return request.post({
        url: werckerConfig.apiUrl + '/api/v3/runs',
        json: {
          pipelineId: createBranchPipelineIds.pipeline,
          sourceRunId: lastDevelopBuilds.pipeline
        },
        headers: {
          Authorization: 'Bearer ' + werckerConfig.token
        }
      })
      .then(function (res) {
        startedPipelineIds[pipelineName] = res.id
      })
    })
  }

  promisee = promisee.then(function () {
    return startedPipelineIds
  })

  return promisee
}

function getAllLastBuildsOnBranch(sourcePipelineBuildIds, branch, werckerConfig) {
  let lastPipelineBuildIds = {}

  return Object.entries(sourcePipelineBuildIds)
  .reduce((promise, [key, value]) => {
      return promise
      .then(() => {
        return request.get({
          url: werckerConfig.apiUrl + '/api/v3/runs',
          qs: {
            pipelineId: value,
            status: 'finished',
            branch: branch
          },
          json: true,
          resolveWithFullResponse: true,
          headers: {
            Authorization: 'Bearer ' + werckerConfig.token
          }
        })
        .then((res) => {
          const lastPipelineBuild = res.body[0] && res.body[0].id

          if (!lastPipelineBuild) {
            throw new Error('No previous source pipeline found')
          }

          lastPipelineBuildIds[key] = lastPipelineBuild
        })
      })
    },
    Promise.resolve()
  )
  .then(() => {

    return lastPipelineBuildIds
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
}


// function getAllLastDevelopBuilds() {
//   let requestPromises = []
//   let lastPipelineBuildIds = {}
//
//   return Promise.all(Object.entries(sourcePipelineBuildIds).reduce((buildIds, [key, value]) => {
//     requestPromises.push(request.get({
//       url: "https://app.wercker.com/api/v3/runs",
//       qs: {
//         pipelineId: value,
//         status: 'finished',
//         branch: 'develop'
//       },
//       json: true,
//       resolveWithFullResponse: true,
//       headers: {
//         Authorization: "Bearer " + token
//       }
//     })
//       .then(async (res) => {
//         const lastPipelineBuild = res.body[0].id
//
//         lastPipelineBuildIds[key] = lastPipelineBuild
//       })
//       .catch((err) => {
//         console.error(err)
//         process.exit(1)
//       }))
//
//     return requestPromises
//   }, [])).then(() => {
//     return lastPipelineBuildIds
//   })
// }

