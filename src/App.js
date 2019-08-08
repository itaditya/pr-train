import React, { Fragment, useEffect, useState, useReducer } from 'react';
import './App.css';

import { fixtureReviewApi } from './apiFixtures';

const rtf = new Intl.RelativeTimeFormat('en');
const skeletonArray = [0, 1, 2, 3];

function cn(classObj) {
  const classList = [];
  Object.entries(classObj).forEach(([className, condition]) => {
    if(condition) {
      classList.push(className);
    }
  })

  return classList.join(' ');
}

function getRelativePRAge(secPRAge) {
  const dayAge = -1 * parseInt(secPRAge / (60 * 60 * 24));
  const relPRAge = rtf.format(dayAge, 'day');

  return relPRAge;
}

function useApi(initialState) {
  const[apiState, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'API_LOADED': return {
        ...state,
        loading: false,
      };
      case 'API_ERRORED': return {
        ...state,
        error: action.payload,
      };
      default: return state;
    }
  }, initialState);

  return [apiState, dispatch];
}

function App() {
  const [apiState, dispatchApi] = useApi({loading: true, error: false});
  const [reviewersListState, setReviewers] = useState(skeletonArray); // aditodo temp hack
  const [assignedPRState, setAssignedPR] = useState({});

  const isLoadingState = apiState.loading;
  const isErrorState = !!apiState.error;

  useEffect(() => {
    (async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const team = urlParams.get('team') || '';

        const apiRes = await fetch(`http://localhost:9999/api/reviewers?team=${team}`);
        const apiData = await apiRes.json();

        if(!apiRes.ok) {
          const e = new Error(apiData.message);
          e.id = apiData.id;
        }

        const {reviewersList, assignedPR} = apiData; // aditodo uncomment this
        setReviewers(reviewersList);
        setAssignedPR(assignedPR);
        dispatchApi({type: 'API_LOADED'}); // aditodo uncomment this
      } catch(error) {
        const errorData = {
          message: error.message,
          id: error.id,
        };
        dispatchApi({type: 'API_ERRORED', payload: errorData});
      }
    })();
  }, [dispatchApi]);

  return (
    <div className="App">
      <nav className="navBar">
        <h1 className="pageTitle">
          Find devs free for PR review
        </h1>
      </nav>
      <main className="reviewersList">
        {
          isErrorState
          ? (
            <p>Some Error Occurred</p>
          ) : (
            reviewersListState.map((reviewer) => (
              <div className="reviewerPRList" key={reviewer}>
                <h2 className={cn({'reviewerHeading': true, 'reviewerHeading-loading': isLoadingState})}>
                  {!isLoadingState && (
                    <Fragment>
                      <strong className="reviewerName">{reviewer}</strong>
                      <br />
                      needs to review
                    </Fragment>
                  )}
                </h2>
                {
                  isLoadingState
                    ? (
                      <article className="prCard prCard-loading"></article>
                    ) : (
                      (assignedPRState[reviewer] || []).map((pr) => (
                        <article className="prCard" key={pr.id}>
                          <h3 className="prTitle">
                            <a className="prLink" target="_blank" rel="noopener noreferrer" href={pr.link}>{pr.title}</a>
                          </h3>
                          {/* <p>{getRelativePRAge(pr.secPRAge)}</p> */}
                          <p className="prDetails">
                            <span className="prSlug">
                              {pr.repo}
                              &nbsp;
                              /
                              &nbsp;
                              <strong className="prNumber">
                                #{pr.number}
                              </strong>
                            </span>
                            <span className="prAuthor">{pr.author}</span>
                          </p>
                        </article>
                    )
                  ))
                }
              </div>
            ))
          )
        }
      </main>
    </div>
  );
}

export default App;
