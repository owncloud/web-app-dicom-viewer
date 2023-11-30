import vtkArrowSource from './Sources/ArrowSource.js';
import vtkCircleSource from './Sources/CircleSource.js';
import vtkConcentricCylinderSource from './Sources/ConcentricCylinderSource.js';
import vtkConeSource from './Sources/ConeSource.js';
import vtkCubeSource from './Sources/CubeSource.js';
import vtkCursor3D from './Sources/Cursor3D.js';
import vtkCylinderSource from './Sources/CylinderSource.js';
import vtkImageGridSource from './Sources/ImageGridSource.js';
import vtkLineSource from './Sources/LineSource.js';
import vtkPlaneSource from './Sources/PlaneSource.js';
import vtkPointSource from './Sources/PointSource.js';
import vtkRTAnalyticSource from './Sources/RTAnalyticSource.js';
import vtkSLICSource from './Sources/SLICSource.js';
import vtkSphereSource from './Sources/SphereSource.js';

var Sources = {
  vtkArrowSource: vtkArrowSource,
  vtkCircleSource: vtkCircleSource,
  vtkConcentricCylinderSource: vtkConcentricCylinderSource,
  vtkConeSource: vtkConeSource,
  vtkCubeSource: vtkCubeSource,
  vtkCursor3D: vtkCursor3D,
  vtkCylinderSource: vtkCylinderSource,
  vtkImageGridSource: vtkImageGridSource,
  vtkLineSource: vtkLineSource,
  vtkPlaneSource: vtkPlaneSource,
  vtkPointSource: vtkPointSource,
  vtkRTAnalyticSource: vtkRTAnalyticSource,
  vtkSLICSource: vtkSLICSource,
  vtkSphereSource: vtkSphereSource
};

export { Sources as default };
