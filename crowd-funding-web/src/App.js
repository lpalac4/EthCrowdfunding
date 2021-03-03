import './App.css';
import React, { Component } from 'react';
import { Campaign } from './components/Campaign';
import { Home } from './components/Home';
import { NotFound } from './components/NotFound';
import history from './history';
import { Route, Router, Switch } from 'react-router-dom';
import { Menu, Container } from 'semantic-ui-react';

class App extends Component {

  render() {
    return (
      <Router history={history}>
        <Container>
          <Menu secondary>
            <Menu.Item name='home' onClick={this.navigateToHome}/>
         </Menu>
          <Switch>
            <Route exact path='/' component={Home}/>
            <Route path='/campaigns/:address' component={Campaign}/>
            <Route component={NotFound} />
          </Switch>
        </Container>
      </Router>
    );
  }

  navigateToHome(e) {
    e.preventDefault();
    history.push('/');
  }
}

export default App;

