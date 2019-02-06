import fetch from 'isomorphic-fetch'
export const REPOS_LOADED = 'REPOS_LOADED';

export const initialState = {
  items: [],
  loading: true,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case REPOS_LOADED:
      return Object.assign({}, state, { items: action.items, loading: false });
    case "LOADING":
      return Object.assign({}, state, { loading: action.value });
    default:
      return state;
  }
}

export const fetchPopularRepos = (language = 'all') => (dispatch) => {
  const encodedURI = encodeURI(`https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`)
  dispatch({ type: "LOADING", value: true });
  return fetch(encodedURI)
    .then((res) => res.json())
    .then((repos) => {
      dispatch({ type: REPOS_LOADED, items: repos.items })
      dispatch({ type: "LOADING", value: false });
    })
    .catch((error) => {
      console.warn(error)
      return null
    });
} 