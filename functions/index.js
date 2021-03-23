const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
db.settings({ignoreUndefinedProperties: true});
const fetch = require("node-fetch");
let scenarioData;
const fetchScenarioJSON = async (scenarioId) => {
  try {
    const response = await fetch(`https://beta.leplanner.net/api/scenarios/single/${scenarioId}`);
    const scenarioText = await response.text();
    scenarioData = JSON.parse(scenarioText);
  } catch (err) {
    return ("not valid json");
  }
  return scenarioData;
};

/**
 * Add data to Firestore.
 * @param {JSON} scenario JSON array containing the scenario data.
 */
async function addDataToFirestore(scenario) {
  const docRef = db.collection("scenarios").doc(scenario.scenario._id);
  await docRef.set({
    id: scenario.scenario._id,
    name: scenario.scenario.name,
    description: scenario.scenario.description,
    language: scenario.scenario.language,
    author: scenario.scenario.author,
    draft: scenario.scenario.draft,
    last_modified: scenario.scenario.last_modified,
    __v: scenario.scenario.__v,
    duration: scenario.scenario.duration,
    grade: scenario.scenario.grade,
    deleted: scenario.scenario.deleted,
    view_count: scenario.scenario.view_count,
    comments_count: scenario.scenario.comments_count,
    favorites_count: scenario.scenario.favorites_count,
    activities_duration: scenario.scenario.activities_duration,
    activities: scenario.scenario.activities,
    outcomes: scenario.scenario.outcomes,
    tags: scenario.scenario.tags,
    students: scenario.scenario.students,
    created: scenario.scenario.created,
    subjects: scenario.scenario.subjects,
  });
}

exports.leplannerToDB =
functions.https.onRequest((request, response) => {
  return fetchScenarioJSON(request.query.id).then((scenario) => {
    if (typeof scenario === "string") {
      if (scenario.includes("not valid json")) {
        response.send("not valid json");
      }
    } else {
      addDataToFirestore(scenario);
      response.send("done!");
    }
  });
});
