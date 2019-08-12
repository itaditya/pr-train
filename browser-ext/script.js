console.log('PRTRAIN: extension loaded');

// const API_URL = 'http://localhost:9999/api/pendingPRCount';
const API_URL = 'https://pr-train.herokuapp.com/api/pendingPRCount';

const getAssigneeElem = () => document.querySelectorAll('a.assignee');

function getReviewersList(elemReviewers) {
  const arrElemReviewers = [...elemReviewers];
  const reviewers = arrElemReviewers.map(elem => {
    return elem.querySelector('span').innerText;
  });
  console.log('PRTRAIN: reviewers', reviewers);
  return reviewers;
}

function addCount(elemReviewer, count) {
  const h = `<span class="Counter">${count}</span>`;
  elemReviewer.insertAdjacentHTML('beforeend', h);
}

const intervalId = setInterval(async () => {
  try {
    console.log('PRTRAIN: check if assignee loaded');
    const elemReviewers = getAssigneeElem();
    if(elemReviewers.length > 0) {
      console.log('PRTRAIN: reviewers loaded');
      const reviewers = getReviewersList(elemReviewers);

      const elemSuggestionHeading = document.querySelector('#reviewers-select-menu + span > p');

      if(!elemSuggestionHeading) {
        return;
      }

      if(elemSuggestionHeading.length === 0) {
        return;
      }

      clearInterval(intervalId);
      const originalSuggestionHeading = elemSuggestionHeading.innerHTML;
      elemSuggestionHeading.innerHTML = 'Loading pending PR count...';

      const reviewersUrlQuery = reviewers.join(',');
      const apiRes = await fetch(`${API_URL}?reviewers=${reviewersUrlQuery}`);
      const apiJson = await apiRes.json();

      const { assignedPR } = apiJson;

      reviewers.forEach((reviewer, i) => {
        addCount(elemReviewers[i], assignedPR[reviewer]);
      });

      elemSuggestionHeading.innerHTML = originalSuggestionHeading;
    }
  } catch(error) {
    clearInterval(intervalId);
    console.error(error);
  }
}, 800);
