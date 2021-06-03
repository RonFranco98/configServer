import React, {Component} from 'react';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';


export default class JsonView extends Component {
    styles = {
        root:{
            height:"100%",
            overflow:"auto"
        }
    }
  componentDidMount () {
    const options = {
      mode: 'code',
      onChangeJSON:this.props.onChangeJSON
    };
    this.jsoneditor = new JSONEditor(this.container, options);
    this.jsoneditor.set(this.props.Entitie);
  }
  componentDidUpdate(){
    console.log(this.props.Entitie)
    this.jsoneditor.update(this.props.Entitie)
  }
  render() {
    return (
        <div style={this.styles.root} ref={elem => this.container = elem} />
    );
  }
}