document.addEventListener("DOMContentLoaded", function () {
  let studiesMap = new Map();
  let studiesIterator;

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
    studiesIterator = studiesMap.values(); // Create an iterator for studies
    console.log("Studies loaded into memory");
  }

  function loadFirstStudy() {
    console.log("Loading first study");
    const firstStudy = studiesIterator.next().value;
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

      const studyOptions = document.getElementById("study-options");
      studyOptions.innerHTML = "";

      Object.keys(study.answers).forEach((key) => {
        const option = document.createElement("div");
        option.className = "form-check";
        option.innerHTML = `<input class="form-check-input" type="radio" name="studyOption" id="option-${key}" value="${key}">
            <label class="form-check-label" for="option-${key}">${study.answers[key]}</label>`;
        studyOptions.appendChild(option);
      });

      document.getElementById("study-form").onsubmit = function (e) {
        e.preventDefault();
        const selectedOption = document.querySelector(
          'input[name="studyOption"]:checked'
        );
        const resultDiv = document.getElementById("result");
        const summaryDiv = document.getElementById("study-summary");

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

        // Add event listener for the Next button
        document
          .getElementById("next-study")
          ?.addEventListener("click", function () {
            const nextStudy = studiesIterator.next().value;
            if (nextStudy) {
              loadStudy(nextStudy.id);
              resetForm();
            } else {
              resultDiv.innerHTML =
                '<span class="text-info">No more studies available.</span>';
              summaryDiv.innerHTML = "";
            }
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
