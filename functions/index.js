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
 * Add Leplanner scenario data to Firestore.
 * @param {JSON} scenario JSON array containing the scenario data.
 */
async function addDataToFirestore(scenario) {
  const data = {
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
  };
  await db.collection("scenarios").doc(scenario.scenario._id).set(data);
}

exports.callLeplannerToDB =
    functions.https.onCall(async (data, context) => {
      const id = data.id;

      try {
        
        const scenario = await fetchScenarioJSON(data.id);
        if (typeof scenario === "string") {
            if (scenario.includes("not valid json")) {
                return 'not valid json';
            }
        } else {
            await addDataToFirestore(scenario);
            return `Done! Added scenario with ID ${data.id} to the app database.`;
        }
    } catch (error) {
      return `Failed to fetch the scenario.`;
    }      

    });
