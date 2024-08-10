document.addEventListener("DOMContentLoaded", function () {

  let studiesMap = new Map();

  fetch("data/studies.json")
    .then((response) => response.json())
    .then((studies) => {
      console.log("Studies.json retrieved");

      initStudies(studies);

      const urlParams = new URLSearchParams(window.location.search);
      const studyId = urlParams.get("studyId");

      if (studyId && studiesMap.has(studyId)) {
        loadStudy(studyId);
      } else {
        loadFirstStudy();
      }
    })
    .catch((error) => console.error("Error fetching studies:", error));

  function initStudies(studies) {
    studies.forEach((study) => {
      studiesMap.set(study.id, study);
    });
    console.log("Studies loaded into memory");
  }

  function loadFirstStudy() {
    console.log("Loading first study");
    const firstStudy = studiesMap.values().next().value;
    if (firstStudy) {
      loadStudy(firstStudy.id);
    } else {
      console.error("No studies available.");
    }
  }

  function loadStudy(studyId) {
    console.log("Loading studyId=" + studyId);
    const study = studiesMap.get(studyId);
    if (study) {
      document.getElementById("study-image").src = `images/${study.image}`;
      document.getElementById(
        "study-title"
      ).textContent = `Study ID: ${study.id}`;
    } else {
      console.error("Study ID not found.");
    }
  }
});
