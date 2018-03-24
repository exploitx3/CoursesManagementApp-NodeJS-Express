'use strict'
const request = require('request-promise')
const token = 'e4a601d7500eaf85d7ba15caa73799db21cb2ab7aaf3d514b9b4f9c3489860d3'
const qs = require('qs')

const createBranchPipelineIds = {
  pipeline: '5a8c907557a1d8010046d567',

}

const sourcePipelineBuildIds = {
  pipeline: '5a8c9bc17f0b540001bf4412',

}

// request.post({
//   url: "https://app.wercker.com/api/v3/runs",
//   json: {
//     pipelineId: createBranchPipelineIds.angularConsumerFe,
//     sourcePipelineId: 'sourceBuilds',
//     envVars: [
//       {'key': 'FROM_BRANCH', 'value': 'develop'},
//       {'key': 'NEW_BRANCH', 'value': 'test-branch-auto'}
//     ]
//   },
//   headers: {
//     Authorization: "Bearer " + token
//   }
// }, function (err, res) {
//   console.log("res status ", res.statusCode);
//   console.log(res.body);
// });

function getAllLastDevelopBuilds(sourcePipelineBuildIds) {
  let lastPipelineBuildIds = {}

  return Object.entries(sourcePipelineBuildIds)
    .reduce((promise, [key, value]) => {
        return promise.then(() => {
          return request.get({
            url: 'https://app.wercker.com/api/v3/runs',
            qs: {
              pipelineId: value,
              status: 'finished',
              branch: 'master'
            },
            json: true,
            resolveWithFullResponse: true,
            headers: {
              Authorization: 'Bearer ' + token
            }
          })
            .then((res) => {
              const lastPipelineBuild = res.body[0].id

              lastPipelineBuildIds[key] = lastPipelineBuild
            })
        })
      },
      Promise.resolve()
        .catch((err) => {
          console.error(err)
          process.exit(1)
        })
    ).then(() => {

      return lastPipelineBuildIds
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


getAllLastDevelopBuilds(sourcePipelineBuildIds).then((lastPipelineBuildIds) => {

  console.log(lastPipelineBuildIds)
})