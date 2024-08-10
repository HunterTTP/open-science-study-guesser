document.addEventListener("DOMContentLoaded", function () {
  let studiesMap = new Map();
  let studiesIterator;
  const resultDiv = document.getElementById("result");
  const summaryDiv = document.getElementById("study-summary");
  const studyImage = document.getElementById("study-image");
  const studyTitle = document.getElementById("study-title");
  const studyQuestion = document.getElementById("study-question");
  const studyAnswers = document.getElementById("study-answers");
  const submitGuessForm = document.getElementById("submit-guess-form");
  const submitGuessButton = document.getElementById("submit-guess-button");

  fetchStudies();

  function fetchStudies() {
    fetch("data/studies.json")
      .then((response) => response.json())
      .then(handleStudiesFetch)
      .catch((error) => console.error("Error fetching studies:", error));
  }

  function handleStudiesFetch(studies) {
    initStudies(studies);
    const studyId = getUrlParameter("studyId");
    if (studyId && studiesMap.has(studyId)) {
      loadStudyById(studyId);
    } else {
      loadNextStudy();
    }
  }

  function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  function initStudies(studies) {
    studies.forEach((study) => studiesMap.set(study.id, study));
    studiesIterator = studiesMap.values();
  }

  function loadNextStudy() {
    const nextStudy = studiesIterator.next().value;
    if (nextStudy) {
      loadStudyById(nextStudy.id);
    } else {
      displayNoMoreStudiesMessage();
    }
  }

  function displayNoMoreStudiesMessage() {
    resetForm();
    resultDiv.innerHTML = '<span class="text-info">You have completed all the studies! Come back soon for more.</span>';
  }

  function loadStudyById(studyId) {
    resetForm();
    const study = studiesMap.get(studyId);
    if (study) {
      displayStudy(study);
      setupSubmitGuessButton(study);
    } else {
      console.error("Study ID not found.");
    }
  }

  function displayStudy(study) {
    studyImage.src = `images/${study.image}`;
    studyTitle.textContent = study.source_name + " - " + study.id;
    studyQuestion.hidden = false;
    populateStudyAnswers(study.answers);
    submitGuessForm.hidden = false;
  }

  function populateStudyAnswers(answers) {
    studyAnswers.innerHTML = "";
    Object.keys(answers).forEach((key) => {
      const option = createAnswerOption(key, answers[key]);
      studyAnswers.appendChild(option);
    });
  }

  function createAnswerOption(key, answer) {
    const option = document.createElement("div");
    option.className = "form-check";
    option.innerHTML = `<input class="form-check-input" type="radio" name="study-answer" id="option-${key}" value="${key}">
                        <label class="form-check-label" for="option-${key}">${answer}</label>`;
    return option;
  }

  function setupSubmitGuessButton(study) {
    submitGuessButton.removeAttribute("hidden");
    submitGuessForm.onsubmit = function (e) {
      e.preventDefault();
      const selectedOption = getSelectedAnswer();
      if (selectedOption) {
        processGuessSelection(selectedOption.value, study);
      } else {
        displayNoSelectionWarning();
      }
    };
  }

  function getSelectedAnswer() {
    return document.querySelector('input[name="study-answer"]:checked');
  }

  function processGuessSelection(selectedValue, study) {
    if (selectedValue === study["correct-answer"]) {
      displayCorrectAnswer(study);
    } else {
      displayIncorrectAnswer();
    }
  }

  function displayCorrectAnswer(study) {
    resetForm();
    resultDiv.innerHTML = '<span class="text-success">Correct!</span>';
    summaryDiv.innerHTML = `<p><strong>Summary:</strong> ${study.summary}
                            <a href="${study["source-url"]}" target="_blank" rel="noopener noreferrer">Learn more</a></p>
                            <button id="next-study" class="btn btn-secondary mt-3">Next Study</button>`;
    document.getElementById("next-study").addEventListener("click", loadNextStudy);
  }

  function displayIncorrectAnswer() {
    resultDiv.innerHTML = '<span class="text-danger">Incorrect. Try again!</span>';
  }

  function displayNoSelectionWarning() {
    resultDiv.innerHTML = '<span class="text-warning">Please select an option.</span>';
  }

  function resetForm() {
    if (submitGuessForm) {
      submitGuessButton.setAttribute("hidden", "hidden");
    }
    if (studyQuestion) {
      studyQuestion.hidden = true;
    }
    if (studyAnswers) {
      studyAnswers.innerHTML = "";
    }
    if (resultDiv) {
      resultDiv.innerHTML = "";
    }
    if (summaryDiv) {
      summaryDiv.innerHTML = "";
    }
  }
});
