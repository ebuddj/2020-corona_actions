import React, {Component} from 'react'
import style from './../styles/styles.less';

// https://alligator.io/react/axios-react/
import axios from 'axios';

// https://underscorejs.org/
import _ from 'underscore';

// https://github.com/topojson/topojson
import * as topojson from 'topojson';

// https://www.npmjs.com/package/rc-slider
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';
import './../styles/rc-slider-override.css';

// https://d3js.org/
import * as d3 from 'd3';

let interval, g, path;
const projection = d3.geoAzimuthalEquidistant().center([33,57]).scale(800);

const languages = {
  'en': {
  },
  'sv':{
  }
}

function getHashValue(key) {
  let matches = location.hash.match(new RegExp(key+'=([^&]*)'));
  return matches ? matches[1] : null;
}

const type = getHashValue('type') ? getHashValue('type') : '5a';

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      data:{},
      dates:[],
      date_inx:0
    }
  }
  componentDidMount() {
    axios.get('./data/data_primary_schools.json', {
    })
    .then((response) => {
      this.setState((state, props) => ({
        data:response.data,
        dates:['2020-03-01','2020-03-02','2020-03-03','2020-03-04','2020-03-05','2020-03-06','2020-03-07','2020-03-08','2020-03-09','2020-03-10','2020-03-11','2020-03-12','2020-03-13','2020-03-14','2020-03-15','2020-03-16','2020-03-17','2020-03-18','2020-03-19','2020-03-20','2020-03-21','2020-03-22','2020-03-23','2020-03-24','2020-03-25','2020-03-26','2020-03-27','2020-03-28','2020-03-29','2020-03-30']
      }), this.drawMap);
    })
    .catch(function (error) {
    })
    .then(function () {
    });
  }
  drawMap() {
    let width = 720;
    let height = 720;
    
    let svg = d3.select('.' + style.map_container).append('svg').attr('width', width).attr('height', height);
    path = d3.geoPath().projection(projection);
    g = svg.append('g');

    let tooltip = d3.select('.' + style.map_container)
      .append('div')
      .attr('class', style.hidden + ' ' + style.tooltip);
    d3.json('./data/europe.topojson').then((topology) => {
      g.selectAll('path').data(topojson.feature(topology, topology.objects.europe).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', style.path)
        .attr('fill', (d, i) => {
          return this.getCountryColor(d.properties.NAME);
        });
     
      let date = this.state.dates[this.state.date_inx].split('/');

    });
    setTimeout(() => {
      this.createInterval();
    }, 3000);
  }
  changeCountryAttributes() {
    // Change fill color.
    g.selectAll('path')
      .attr('fill', (d, i) => {
        return this.getCountryColor(d.properties.NAME);
      });
  }
  getCountryColor(country) {
    if (this.state.data[country] !== undefined) {
      console.log()
      if (this.state.data[country]['5a. Primary schools (and all that are not universities or superior studies) facilities closed'] === '') {
        return '#e5e5e5';
      }
      else if (this.state.data[country]['5a. Primary schools (and all that are not universities or superior studies) facilities closed'] > this.state.dates[this.state.date_inx]) {
        return '#e5e5e5';
      }
      else {
        return '#808080';
      }
    }
    else {
      return '#ffffff';
    }
  }
  onBeforeSliderChange(value) {
    if (interval) {
      clearInterval(interval)
    }
  }
  onSliderChange(value) {
    this.setState((state, props) => ({
      total_cases:0,
      date_inx:value
    }), this.changeCountryAttributes);
  }
  onAfterSliderChange(value) {
  }
  componentWillUnMount() {
    clearInterval(interval);
  }
  createInterval() {
    this.changeCountryAttributes();
    interval = setInterval(() => {
      this.setState((state, props) => ({
        date_inx:this.state.date_inx + 1
      }), this.changeCountryAttributes);
      if (this.state.date_inx >= (this.state.dates.length - 1)) {
        clearInterval(interval);
        setTimeout(() => {
          this.setState((state, props) => ({
            date_inx:0
          }), this.createInterval);
        }, 2000);
      }
    }, 1000);
  }
  render() {
    let date_text = '';
    if (this.state.dates[this.state.date_inx]) {
      let datetime = this.state.dates[this.state.date_inx].split(' ');
      let date = datetime[0].split('-');
      let time = datetime[1];
      date_text = '' + parseInt(date[2]) + '.' + parseInt(date[1]) + '.' + date[0];
    }
    return (
      <div className={style.plus}>
        <div>
          <Slider
            className={style.slider_container}
            dots={false}
            max={this.state.dates.length - 1}
            onAfterChange={this.onAfterSliderChange.bind(this)}
            onBeforeChange={this.onBeforeSliderChange}
            onChange={this.onSliderChange.bind(this)}
            value={this.state.date_inx}
          />
          <div className={style.map_container}></div>
          <div className={style.date_text}>{date_text}</div>
        </div>
      </div>
    );
  }
}
export default App;