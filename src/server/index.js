import express from "express"
import cors from "cors"
import React from "react"
import { renderToString } from "react-dom/server"
import { StaticRouter, matchPath } from "react-router-dom"
import serialize from "serialize-javascript"
import App from '../shared/App'
import routes from '../shared/routes'
import { matchRoutes, renderRoutes } from 'react-router-config';

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducers, { initialState } from '../shared/api';

const port = 2000;

const app = express()

app.use(cors())
app.use(express.static("public"))
app.get("*", handleRender);
app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`)
})
function handleRender(req, res, next) {

    const store = createStore(reducers, initialState, applyMiddleware(thunk));

    const branch = matchRoutes(routes, req.url);
    console.log("branch.length,req.url  %o", branch.length, req.url);
    const promises = branch.map(({ route }) => {
        let fetchData = route.component.fetchData;
        return fetchData instanceof Function ? fetchData(store) : Promise.resolve(null)
    });

    return Promise.all(promises).then((data) => {
        // needed for Static Router
        const context = {}
        const html = renderToString(
            <Provider store={store}>
                <StaticRouter location={req.url} context={context}>
                    <App />
                </StaticRouter>
            </Provider>
        )
        // Grab the initial state from our Redux store
        const preloadedState = store.getState()
        res.send(renderFullPage(html, preloadedState))
        //res.render('index', { title: 'Express', data: store.getState(), html });
    }).catch(next)
}


function renderFullPage(html, preloadedState) {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SSR with RR</title>  
        <link rel="shortcut icon" href="#" />
        <script src="/bundle.js" defer></script>      
        <script>
          // WARNING: See the following for security issues around embedding JSON in HTML:
          // http://redux.js.org/recipes/ServerRendering.html#security-considerations
          window.__PRELOADED_STATE__ = ${serialize(preloadedState)}
        </script>
      </head>
      <body>
        <div id="app">${html}</div>        
      </body>
    </html>
  `
}
