document.addEventListener("DOMContentLoaded", function () {
  let studiesMap = new Map();
  let studiesIterator;
  const resultDiv = document.getElementById("result");
  const summaryDiv = document.getElementById("study-summary");

  fetch("data/studies.json")
    .then((response) => response.json())
    .then((studies) => {
      console.log("Studies.json retrieved");

      initStudies(studies);

      const urlParams = new URLSearchParams(window.location.search);
      const studyId = urlParams.get("studyId");

      if (studyId && studiesMap.has(studyId)) {
        loadStudyById(studyId);
      } else {
        loadNextStudy();
      }
    })
    .catch((error) => console.error("Error fetching studies:", error));

  function initStudies(studies) {
    studies.forEach((study) => {
      studiesMap.set(study.id, study);
    });
    studiesIterator = studiesMap.values();
    console.log("Studies loaded into memory");
  }

  function loadNextStudy() {
    console.log("Loading next study");
    const nextStudy = studiesIterator.next().value;
    if (nextStudy) {
      loadStudyById(nextStudy.id);
    } else {
      resultDiv.innerHTML = '<span class="text-info">You have completed all the studies! Come back soon for more.</span>';
      console.log("No more studies in memory.");
    }
  }

  function loadStudyById(studyId) {
    console.log("Loading studyId=" + studyId);
    resetForm();
    const study = studiesMap.get(studyId);
    if (study) {
      document.getElementById("study-image").src = `images/${study.image}`;
      document.getElementById("study-title").textContent = `${study.id}`;

      const studyAnswers = document.getElementById("study-answers");
      studyAnswers.innerHTML = "";

      Object.keys(study.answers).forEach((key) => {
        const option = document.createElement("div");
        option.className = "form-check";
        option.innerHTML = `<input class="form-check-input" type="radio" name="study-answer" id="option-${key}" value="${key}">
            <label class="form-check-label" for="option-${key}">${study.answers[key]}</label>`;
        studyAnswers.appendChild(option);
      });

      document.getElementById("study-form").onsubmit = function (e) {
        e.preventDefault();
        const selectedOption = document.querySelector(
          'input[name="study-answer"]:checked'
        );

        if (selectedOption) {
          if (selectedOption.value === study["correct-answer"]) {
            resultDiv.innerHTML = '<span class="text-success">Correct!</span>';
            summaryDiv.innerHTML = `<p><strong>Summary:</strong> ${study.summary}
            <a href="${study["source-url"]}" target="_blank" rel="noopener noreferrer">Learn more</a></p><p></p>
            <button id="next-study" class="btn btn-secondary mt-3">Next Study</button><p></p>`;
          } else {
            resultDiv.innerHTML =
              '<span class="text-danger">Incorrect. Try again!</span>';
          }
        } else {
          resultDiv.innerHTML =
            '<span class="text-warning">Please select an option.</span>';
        }

        document.getElementById("next-study").addEventListener("click", function () {
            loadNextStudy();
          });
      };
    } else {
      console.error("Study ID not found.");
    }
  }

  function resetForm() {
    document.getElementById("study-form").reset();
    document.getElementById("result").innerHTML = "";
    document.getElementById("study-summary").innerHTML = "";
  }
});