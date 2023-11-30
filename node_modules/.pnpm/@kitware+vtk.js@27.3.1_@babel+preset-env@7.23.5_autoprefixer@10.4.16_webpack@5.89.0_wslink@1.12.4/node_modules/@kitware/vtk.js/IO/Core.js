import './Core/DataAccessHelper/HtmlDataAccessHelper.js';
import './Core/DataAccessHelper/HttpDataAccessHelper.js';
import './Core/DataAccessHelper/JSZipDataAccessHelper.js';
import BinaryHelper from './Core/BinaryHelper.js';
import DataAccessHelper from './Core/DataAccessHelper.js';
import vtkHttpDataSetReader from './Core/HttpDataSetReader.js';
import vtkHttpSceneLoader from './Core/HttpSceneLoader.js';
import vtkImageStream from './Core/ImageStream.js';
import vtkResourceLoader from './Core/ResourceLoader.js';
import vtkWSLinkClient from './Core/WSLinkClient.js';

// Bundle size management - start
var Core = {
  BinaryHelper: BinaryHelper,
  DataAccessHelper: DataAccessHelper,
  vtkHttpDataSetReader: vtkHttpDataSetReader,
  vtkHttpSceneLoader: vtkHttpSceneLoader,
  vtkImageStream: vtkImageStream,
  vtkResourceLoader: vtkResourceLoader,
  vtkWSLinkClient: vtkWSLinkClient
};

export { Core as default };
