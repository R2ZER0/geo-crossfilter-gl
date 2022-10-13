import Point from "@mapbox/point-geometry";
import { VectorTile } from "@mapbox/vector-tile";
import { Triangulator } from "pnltri";
import Protobuf from "pbf";

import tile1_url from "./data/benefits_8_124_83.pbf";

export type PolyData = {
  vertices: Float32Array,
  featids: Float32Array,
  triangles: Uint32Array,
};

export const EMPTY_POLYDATA: PolyData = {
    vertices: new Float32Array(),
    featids: new Float32Array(),
    triangles: new Uint32Array(),
};

export type MvtFeature = {
    poly: PolyData,
    id: number,
    properties: { [_: string]: string | number | boolean },
    extent: number,
};

export type MvtData = {
  extent: number;
  features: MvtFeature[],
  attributes: PolyData,
};

const mergePolyTris = (a: PolyData, b: PolyData) => {
  let vertices = new Float32Array(a.vertices.length + b.vertices.length);
  vertices.set(a.vertices, 0);
  vertices.set(b.vertices, a.vertices.length);
  
  let featids = new Float32Array(a.featids.length + b.featids.length);
  featids.set(a.featids, 0);
  featids.set(b.featids, a.featids.length);

  let triangles = new Uint32Array(a.triangles.length + b.triangles.length);
  triangles.set(a.triangles, 0);
  triangles.set(b.triangles.map(v => v + (a.vertices.length / 2)), a.triangles.length);


  return {
    vertices,
    featids,
    triangles,
  };
};

const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export const loadMvtData = async (tile_url: string) => {
  const res = await fetch(tile_url);

  if (!res.ok || res.status != 200) {
    console.error(`Failed to load MVT from URL`, tile_url, 'response', res);
    return Promise.reject(`Failed to load MVT from URL ${tile_url} response ${res}`);
  }
  
  const reader = res.body?.getReader();
  await sleep(250); // There is some strange bug that throws an eror if you read too soon? 
  const data = await reader?.read();

  const pdata = new Protobuf(data?.value);
  const tile = new VectorTile(pdata);

  const layerName = Object.keys(tile.layers)[0];
  const layer = tile.layers[layerName];
  const extent = layer.extent;

  const triangulator = new Triangulator();

  const features: MvtFeature[] = new Array(layer.length);

  for (let i = 0; i < features.length; i++) {
    const feat = layer.feature(i);
    const featId = i+1;
    const featGeom = feat.loadGeometry();

    const polysTriangles = featGeom.map((poly_points) => {
        const triangList: number[][] = triangulator.triangulate_polygon([poly_points]);
        let poly: PolyData = {
            "vertices": new Float32Array(poly_points.map(p => [p.x, p.y]).flat()),
            "triangles": new Float32Array(triangList.flat()),
            "featids": new Uint32Array(poly_points.length).fill(featId),
        };
        return poly;
    });

    const mergedPolyTriangles = polysTriangles.reduce(mergePolyTris);

    features[i] = {
        "poly": mergedPolyTriangles,
        "id": featId,
        "properties": feat.properties,
        "extent": feat.extent,
    };
  }

  let attributes = features.reduce((p: PolyData, f: MvtFeature) => mergePolyTris(p, f.poly), EMPTY_POLYDATA);

  return {
    extent,
    features,
    attributes,
  };
};