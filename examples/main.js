import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
// import App from '../src/web/create-print/examples/Basic';
import App from '../src/web/copy/examples/Basic';

render(<App />, document.getElementById('pages'));