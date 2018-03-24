'use strict'
const request = require('request-promise')
const qs = require('qs')

const WerckerCli = {}

WerckerCli.init = function (werckerConfig) {
  this.werckerConfig = werckerConfig
}

WerckerCli.triggerCreateReleaseBranchPipelines = function(createBranchPipelineIds, lastDevelopBuilds) {

  request.post({
    url: this.werckerConfig.apiUrl + '/api/v3/runs',
    json: {
      pipelineId: createBranchPipelineIds.pipeline,
      sourcePipelineId: lastDevelopBuilds.pipeline,
      envVars: [
        {'key': 'FROM_BRANCH', 'value': 'develop'},
        {'key': 'NEW_BRANCH', 'value': 'test-branch-auto'}
      ]
    },
    headers: {
      Authorization: 'Bearer ' + this.werckerConfig.token
    }
  }, function (err, res) {
    console.log('res status ', res.statusCode)
    console.log(res.body)
  })
}

WerckerCli.getAllLastBuildsOnBranch = function (sourcePipelineBuildIds, branch) {
  let lastPipelineBuildIds = {}

  return Object.entries(sourcePipelineBuildIds)
    .reduce((promise, [key, value]) => {
        return promise
          .then(() => {
            return request.get({
              url: this.werckerConfig.apiUrl + '/api/v3/runs',
              qs: {
                pipelineId: value,
                status: 'finished',
                branch: branch
              },
              json: true,
              resolveWithFullResponse: true,
              headers: {
                Authorization: 'Bearer ' + this.werckerConfig.token
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

module.exports = WerckerCli

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

