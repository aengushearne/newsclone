import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'
import './styles/index.css'
import { GC_AUTH_TOKEN } from './constants'
import { simple, subscriptions } from './config' 

// 1
import { ApolloProvider, createNetworkInterface, ApolloClient } from 'react-apollo'

// 2
const networkInterface = createNetworkInterface({
  uri: simple
})

const wsClient = new SubscriptionClient(subscriptions, {
  reconnect: true,
  connectionParams: {
     authToken: localStorage.getItem(GC_AUTH_TOKEN),
  }
})

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

networkInterface.use([{
  applyMiddleware(req, next) {
    if (!req.options.headers) {
      req.options.headers = {}
    }
    const token = localStorage.getItem(GC_AUTH_TOKEN)
    req.options.headers.authorization = token ? `Bearer ${token}` : null
    next()
  }
}])

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions
})

// 4
ReactDOM.render(
    <BrowserRouter>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </BrowserRouter>
  , document.getElementById('root')
)
registerServiceWorker()
