import createRegl, { DefaultContext, Regl } from "regl";

import { loadMvtData, MvtData, MvtFeature } from "./mvt";
import { LayerGL } from "./drawLayer";
import { OverlapGL } from "./drawOverlap";
import { LookupGL } from "./drawLookup";
import { FEATID_LIMIT } from "./constants";
import { CrossfilterGL } from "./drawCrossfilter";

// TODO: Use loaders.gl's MVTLoader instead of this custom thing

const SAMPLE_SIZE = 512;

//const MVT1_URL = "https://astrosat-testing-public.s3.dualstack.eu-west-1.amazonaws.com/astrosat/lad_2019_gb_childpov2019_breakdown_raw__mvt/7/62/39.pbf";
//const MVT2_URL = "https://astrosat-testing-public.s3.dualstack.eu-west-1.amazonaws.com/astrosat/lad_2019_gb_childpov2019_breakdown_raw__mvt/7/63/40.pbf";
import MVT1_URL from "./data/layer1.pbf?url";
import MVT2_URL from "./data/layer2.pbf?url";


let initLayer = (regl: Regl, data: MvtData, propName: string) => new LayerGL(regl, {
  data, 
  getFilterValue: (feat: MvtFeature) => feat.properties[propName] as number,
  sampleSize: SAMPLE_SIZE,
});

let rangeMinInput1 = document.getElementById("range-min-1") as HTMLInputElement;
let rangeMaxInput1 = document.getElementById("range-max-1") as HTMLInputElement;

let rangeMinInput2 = document.getElementById("range-min-2") as HTMLInputElement;
let rangeMaxInput2 = document.getElementById("range-max-2") as HTMLInputElement;

const getFilterRanges = () => {
  return {
    "layer1": [parseFloat(rangeMinInput1?.value), parseFloat(rangeMaxInput1?.value)] as [number, number],
    "layer2": [parseFloat(rangeMinInput2?.value), parseFloat(rangeMaxInput2?.value)] as [number, number],
  };
}

const initRegl = (container: string) => createRegl({
  container,
  extensions: ["OES_element_index_uint"],
});

type SetupContext = {
  data1: MvtData;
  data2: MvtData;
};

const setupCanvasLayer1 = ({data1}: SetupContext) => {
  const regl = initRegl("#canvasLayer1");
  let layer1L = initLayer(regl, data1, "households");

  const draw = () => {
    regl.clear({
      color: [0, 0, 0, 1],
    });

    layer1L.draw({
      filterRange: getFilterRanges().layer1,
      toViewport: true,
    });
  };

  regl.frame(draw);
};

const setupCanvasLayer2 = ({data2}: SetupContext) => {
  const regl = initRegl("#canvasLayer2");
  let layer2R = initLayer(regl, data2, "Children in low income families: total");

  const draw = () => {
    regl.clear({
      color: [0, 0, 0, 1],
    });

    layer2R.draw({
      filterRange: getFilterRanges().layer2, 
      toViewport: true,
    });
  };

  regl.frame(draw);
};

const setupCanvasOverlap = ({data1, data2}: SetupContext) => {
  const regl = initRegl("#canvasOverlap");
  let layer1 = initLayer(regl, data1, "households");
  let layer2 = initLayer(regl, data2, "Children in low income families: total");
  let overlap = new OverlapGL(regl, true, layer1.texture, layer2.texture, SAMPLE_SIZE);

  const draw = () => {
    regl.clear({
      color: [0, 0, 0, 1],
    });

    layer1.draw({
      filterRange: getFilterRanges().layer1,
      toViewport: false,
    });
    
    layer2.draw({
      filterRange: getFilterRanges().layer2,
      toViewport: false,
    });

    overlap.draw({});
  };

  regl.frame(draw);
};


const setupCanvasCrossfilter = ({data1, data2}: SetupContext, layer: number) => {
  const regl = initRegl(`#canvasCrossfilter${layer}`);

  let layer1 = initLayer(regl, data1, "households");
  let layer2 = initLayer(regl, data2, "Children in low income families: total");
  let overlap = new OverlapGL(regl, false, layer1.texture, layer2.texture, SAMPLE_SIZE);
  let lookup1 = new LookupGL(regl, false, layer1.texture, overlap.texture, SAMPLE_SIZE);
  let lookup2 = new LookupGL(regl, false, layer2.texture, overlap.texture, SAMPLE_SIZE);

  let crossfilter1 = new CrossfilterGL(regl, data1, lookup1.texture);
  let crossfilter2 = new CrossfilterGL(regl, data2, lookup2.texture);

  const lookupInfoDiv = document.getElementById('lookup-info');

  const draw = ({tick}: DefaultContext) => {
    regl.clear({
      color: [0, 0, 0, 1],
    });

    // Render Layers
    layer1.draw({
      filterRange: getFilterRanges().layer1,
      toViewport: false,
    });
    
    layer2.draw({
      filterRange: getFilterRanges().layer2,
      toViewport: false,
    });

    // Render Overlap
    overlap.draw({});

    // Render Overlap Lookup Indexes
    lookup1.draw();
    lookup2.draw();

    let found1 = 0;
    let found2 = 0;

    // Render Crossfilter
    if(layer < 2) {
      crossfilter1.draw();
    } else {
      crossfilter2.draw();
    }

    if(tick % 16 === 0) {
      // Extract Lookup table info
      regl({ framebuffer: lookup1.framebuffer })(() => {
        let pixels = regl.read({
          x: 0,
          y: 0,
          width: FEATID_LIMIT,
          height: 1,
          data: new Uint8Array(4 * FEATID_LIMIT),
        });

        // Only test Alpha values
        found1 = pixels.filter((value, i) => ((i - 3) % 4 === 0) && value === 255).length;
      });
    
      regl({ framebuffer: lookup2.framebuffer })(() => {
        let pixels = regl.read({
          x: 0,
          y: 0,
          width: FEATID_LIMIT,
          height: 1,
          data: new Uint8Array(4 * FEATID_LIMIT),
        });

        // Only test Alpha values
        found2 = pixels.filter((value, i) => ((i - 3) % 4 === 0) && value === 255).length;
      });


      if(lookupInfoDiv) {
        lookupInfoDiv.innerHTML = `Layer1: ${found1} features<br/>Layer2: ${found2} features`;
      }
    }
  };

  regl.frame(draw);

};

const main = async () => {
  let data1 = await loadMvtData(MVT1_URL);
  let data2 = await loadMvtData(MVT2_URL);
  
  let context: SetupContext = {
    data1, data2,
  };

  // We have to use seperate insances of everything for each canvas
  // because we can't share textures between canvases/GL instances
  // (Or can we? how?)

  setupCanvasLayer1(context);
  setupCanvasLayer2(context);
  setupCanvasOverlap(context);
  setupCanvasCrossfilter(context, 1);
  setupCanvasCrossfilter(context, 2);

};

main().catch(error => console.error('Main Error', error)).then(() => console.log("main complete"));