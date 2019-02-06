import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { fetchPopularRepos } from './api';

class Grid extends Component {
  static fetchData(store) {
    return store.dispatch(fetchPopularRepos());
  }
  constructor(props) {
    super(props)
    this.state = {
      repos: props.items,
      loading: props.loading,
    }

    //this.fetchRepos = this.fetchRepos.bind(this)
  }
  componentDidMount() {
    if (!this.state.repos) {
      this.props.fetchPopularRepos(this.props.match.params.id)
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.props.fetchPopularRepos(this.props.match.params.id)
    }
  }
  componentWillReceiveProps(nextProps) {
    //this.setState()
    let { loading, items } = this.props
    if (nextProps.loading !== loading || JSON.stringify(nextProps.items) !== JSON.stringify(items)) {
      this.setState({ loading: nextProps.loading, repos: nextProps.items })
    }
  }
  /* fetchRepos(lang) {
    this.setState(() => ({
      loading: true
    }))

    this.props.fetchInitialData(lang)
    .then((repos) => this.setState(() => ({
      repos,
      loading: false,
    })))
  } */
  render() {
    const { loading, repos } = this.state

    if (loading === true) {
      return <p>LOADING</p>
    }

    return (
      <ul style={{ display: 'flex', flexWrap: 'wrap' }}>
        {repos.map(({ name, owner, stargazers_count, html_url }) => (
          <li key={name} style={{ margin: 30 }}>
            <ul>
              <li><a href={html_url}>{name}</a></li>
              <li>@{owner.login}</li>
              <li>{stargazers_count} stars</li>
            </ul>
          </li>
        ))}
      </ul>
    )
  }
}

const mapStateToProps = (state) => ({ items: state.items, loading: state.loading });
const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchPopularRepos }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Grid);
