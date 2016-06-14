import React, { Component, PropTypes } from 'react'
import d3 from 'd3'
import Registry from '../../utils/Registry';
import DatamapSubunit from './DatamapSubunit';



export default class Datamap extends Component {
  constructor(props) {
    super(props)
    this.handleMouseEnterOnSubunit = this.handleMouseEnterOnSubunit.bind(this)

    this.state = {
      geometryFeatures: this.props.geometry,
      path: this.path(this.props.svgWidth, this.props.svgHeight),
      svgResized: false,
      defaultScale: this.getDefaultScale()
    }
  }

  componentWillReceiveProps(nextProps) {
    const { svgWidth, svgHeight, geometry } = nextProps
    const path = this.path(svgWidth, svgHeight)

    const svgResized = nextProps.svgWidth !== this.props.svgWidth ||
       nextProps.svgHeight !== this.props.svgHeight
    
    const geometryFeatures = geometry;

    this.setState({ path, geometryFeatures })
  }

  path(svgWidth, svgHeight) {
    const projectionName = this.props.projection
    const scaleDenominator = this.props.scaleDenominator
    const {defaultScale, defaultTranslate} = this.getDefaultScale();
    const scale = this.props.scale || defaultScale;
    const translate = this.props.translate || defaultTranslate;

    console.log('..',defaultScale,defaultTranslate);
    const projection = d3.geo[projectionName]().scale(scale)
    //  .translate(translate)

    return d3.geo.path().projection(projection)
  }
  
  getDefaultScale() {
    let bounds = this.props.outerBounds;
		let dx = bounds[1][0] - bounds[0][0];
    let dy = bounds[1][1] - bounds[0][1];
    let x = (bounds[0][0] + bounds[1][0]) / 2;
    let y = (bounds[0][1] + bounds[1][1]) / 2;
    let scaleDenominator = this.props.scaleDenominator || .9
    let width = this.props.componentWidth;
    let height = width * .8;
    let scale = scaleDenominator / Math.max(dx / width, dy / height);
    let translate = [width / 2 - scale * x, height / 2 - scale * y];
		console.log('getDefScale', scale, translate);
		console.log('getDefScaleparams', bounds, dx, dy, x, y, width, height);
		return ({defaultScale: scale, defaultTranslate: translate});
  }

  handleMouseEnterOnSubunit(name, value, index) {
    const data = this.state.geometryFeatures
    const newData = [
      ...data.slice(0, index),
      ...data.slice(index + 1),
      data[index],
    ]

    this.setState({ geometryFeatures: newData });
    this.props.mouseEnterOnSubunit(name, value);
  }

  renderDatamapSubunits() {
    const { colorScale, noDataColor, borderColor } = this.props

    return this.state.geometryFeatures.map((feature, index) => {
      const key = (this.props.format === 'geojson') ?
        feature.properties[this.props.geometryKeyField] :
        feature.id;

      const subunitData = this.props.regionData.find((datum) => {
        return datum[this.props.dataKeyField] === key
      });

      const subunitValue = subunitData ? subunitData[this.props.dataValueField] : null;
      const fillColor = subunitValue === '' ? noDataColor : colorScale(subunitValue);
      return (
        <DatamapSubunit
          key={key}
          index={index}
          path={() => this.state.path(feature)}
          name={String(key)}
          value={subunitValue}
          svgResized={this.state.svgResized}
          componentWidth={this.props.componentWidth}
          svgWidth={this.props.componentWidth}
          outerBounds={this.props.outerBounds}
          fillColor={fillColor}
          borderColor={borderColor}
          mouseEnterOnSubunit={this.handleMouseEnterOnSubunit}
        />
      )
    })
  }

  render() {
    console.log('Datamap render', this);
    return (
      <g
        onMouseMove={this.props.mouseMoveOnDatamap}
        onMouseEnter={this.props.mouseEnterOnDatamap}
        onMouseLeave={this.props.mouseLeaveDatamap}
      >
        {this.renderDatamapSubunits()}
      </g>
    )
  }
}

Datamap.propTypes = {
  geometry: PropTypes.instanceOf(Array).isRequired,
  svgWidth: PropTypes.number.isRequired,
  svgHeight: PropTypes.number.isRequired,
  mouseMoveOnDatamap: PropTypes.func.isRequired,
  mouseEnterOnDatamap: PropTypes.func.isRequired,
  mouseLeaveDatamap: PropTypes.func.isRequired,
  mouseEnterOnSubunit: PropTypes.func.isRequired,
  regionData: PropTypes.instanceOf(Array).isRequired,
  colorScale: PropTypes.func.isRequired,
  noDataColor: PropTypes.string.isRequired,
  borderColor: PropTypes.string.isRequired,
}

Registry.set('Datamap', Datamap);
