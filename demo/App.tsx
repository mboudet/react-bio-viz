import { useReducer } from "react";

import { GeneModel, MultipleSequenceAlignment, PhyloTree, Tree, SequenceInterval, Sequence } from "../src/index";

function loadJson(filename: string): Tree & SequenceInterval & Sequence[] {
  const request = new XMLHttpRequest();
  request.overrideMimeType("application/json");
  request.open("GET", filename, false);
  request.send(null);
  return JSON.parse(request.responseText);
}

type State = {
  showCladogram: boolean;
  showSupportValues?: boolean;
  shadeBranchBySupport?: boolean;
  fontSize?: number;
  width?: number;
  height?: number;
  panMin: number;
  panMax: number;
};

type Action =
  | { type: "toggleShowCladogram" }
  | { type: "toggleShowSupportValues" }
  | { type: "toggleShadeBranchBySupport" }
  | { type: "setFontSize"; value: number }
  | { type: "setWidth"; value: number }
  | { type: "setHeight"; value: number }
  | { type: 'panLeft' } 
  | { type: 'panRight' }
  | { type: 'zoomIn' }
  | { type: 'zoomOut' }
  | { type: 'panZoomReset' }

function stateReducer(state: State, action: Action): State {
  switch (action.type) {
    case "toggleShowCladogram":
      return { ...state, showCladogram: !state.showCladogram };
    case "toggleShowSupportValues":
      return { ...state, showSupportValues: !state.showSupportValues };
    case "toggleShadeBranchBySupport":
      return { ...state, shadeBranchBySupport: !state.shadeBranchBySupport };
    case "setFontSize":
      return { ...state, fontSize: action.value };
    case "setWidth":
      return { ...state, width: action.value };
    case "setHeight":
      return { ...state, height: action.value };
    case 'panLeft':
      return { ...state, panMin: state.panMin - 10, panMax: state.panMax - 10 };
    case 'panRight':
      return { ...state, panMin: state.panMin + 10, panMax: state.panMax + 10 };
    case 'zoomIn':
      return { ...state, panMin: state.panMin + 10, panMax: state.panMax - 10 };
    case 'zoomOut':
      return { ...state, panMin: state.panMin - 10, panMax: state.panMax + 10 };
    case 'panZoomReset':
      return { ...state, panMin: 0, panMax: 100 };
    default:
      throw new Error("Invalid state operation");
  }
}

export default function App(): JSX.Element {
  const tree: Tree = loadJson("./data/tree.json");
  const msa: Sequence[] = loadJson("./data/msa.json");
  const geneModel: SequenceInterval = loadJson("./data/genemodel.json");
  const [state, dispatch] = useReducer(stateReducer, {
    showCladogram: false,
    showSupportValues: true,
    shadeBranchBySupport: true,
    fontSize: 11,
    width: 940,
    height: 740,
    panMin: 0,
    panMax: 100,
  });

  return (
    <div className="container">
      <hr/>
      <section className='section'>
        <h1 className='title'>GeneModel </h1>
        <div
          className='buttons has-addons'
          style={{ display: 'inline-block', marginRight: '1em' }}
        >
          <button
            className='button is-small'
            onClick={()=>dispatch({type:'panLeft'})}
            disabled={state.panMin <= 0}
          >
            &larr;
          </button>
          <button
            className='button is-small'
            onClick={()=>dispatch({type:'panRight'})}
            disabled={state.panMax >= 100}
          >
            &rarr;
          </button>
        </div>
        <div
          className='buttons has-addons'
          style={{ display: 'inline-block', marginRight: '1em' }}
        >
          <button
            className='button is-small'
            onClick={()=>dispatch({type:'zoomOut'})}
            disabled={state.panMin <= 0 && state.panMax >= 100}
          >-</button>
          <button
            className='button is-small'
            onClick={()=>dispatch({type:'zoomIn'})}
          >+</button>
        </div>
        <button
          className='button is-small'
          onClick={() => dispatch({ type:'panZoomReset' })}
          disabled={!(state.panMin !== 0 || state.panMax !== 100)}
        >
          Reset
        </button>
        <GeneModel gene={geneModel} panMin={state.panMin} panMax={state.panMax}/>
      </section>
      
      <hr/>

      <section className='section'>
        <h1 className='title'>Multiple Sequence Alignment</h1>
        <h2 className='subtitle'>Overview</h2>
        <MultipleSequenceAlignment
          msa={msa}
          colWidth={1}
          width={750}
          rowHeight={0.5}
          showRowHeader={true}
          rowHeaderWidth={150}
          showText={false}
          palette="individual"
        />
  
        <h2 className='subtitle'>Detail</h2>
        <MultipleSequenceAlignment
          msa={msa}
          rowHeight={12}
          rowHeaderWidth={150}
          height={500}
          palette="individual"
        />
      </section>

      <hr/>

      <section className='section'>
      <h1 className='title'>Phylogenetic tree</h1>
        <label>
          <input
            type="checkbox"
            checked={state.showCladogram}
            onChange={() => dispatch({ type: "toggleShowCladogram" })}
          />
          Cladogram
        </label>
        <label>
          <input
            type="checkbox"
            checked={state.showSupportValues}
            onChange={() => dispatch({ type: "toggleShowSupportValues" })}
          />
          Show support values
        </label>
        <label>
          <input
            type="checkbox"
            checked={state.shadeBranchBySupport}
            onChange={() => dispatch({ type: "toggleShadeBranchBySupport" })}
          />
          Shade branches by support values
        </label>
        <br />
        <label>
          Font size
          <input
            type="number"
            value={state.fontSize}
            onChange={({ target: { value } }) =>
              dispatch({
                type: "setFontSize",
                value: Number(value),
              })
            }
            style={{
              width: "4em",
              marginRight: "1em",
            }}
          />
        </label>

        <label>
          Width
          <input
            type="number"
            value={state.width}
            onChange={({ target: { value } }) =>
              dispatch({
                type: "setWidth",
                value: Number(value),
              })
            }
            style={{
              width: "6em",
              marginRight: "1em",
            }}
          />
        </label>

        <label>
          Height
          <input
            type="number"
            value={state.height}
            onChange={({ target: { value } }) =>
              dispatch({
                type: "setHeight",
                value: Number(value),
              })
            }
            style={{
              width: "6em",
              marginRight: "1em",
            }}
          />
        </label>
        <PhyloTree
          tree={tree}
          cladogram={state.showCladogram}
          showSupportValues={state.showSupportValues}
          shadeBranchBySupport={state.shadeBranchBySupport}
          fontSize={state.fontSize}
          width={state.width}
          height={state.height}
        />
      </section>
      <hr/>
    </div>
  );
}
