import vtkElevationReader from './Misc/ElevationReader.js';
import vtkITKImageReader from './Misc/ITKImageReader.js';
import vtkITKPolyDataReader from './Misc/ITKPolyDataReader.js';
import vtkJSONNucleoReader from './Misc/JSONNucleoReader.js';
import vtkJSONReader from './Misc/JSONReader.js';
import vtkMTLReader from './Misc/MTLReader.js';
import vtkOBJReader from './Misc/OBJReader.js';
import vtkPDBReader from './Misc/PDBReader.js';
import vtkSkyboxReader from './Misc/SkyboxReader.js';

var Misc = {
  vtkElevationReader: vtkElevationReader,
  vtkITKImageReader: vtkITKImageReader,
  vtkITKPolyDataReader: vtkITKPolyDataReader,
  vtkJSONNucleoReader: vtkJSONNucleoReader,
  vtkJSONReader: vtkJSONReader,
  vtkMTLReader: vtkMTLReader,
  vtkOBJReader: vtkOBJReader,
  vtkPDBReader: vtkPDBReader,
  vtkSkyboxReader: vtkSkyboxReader
};

export { Misc as default };
