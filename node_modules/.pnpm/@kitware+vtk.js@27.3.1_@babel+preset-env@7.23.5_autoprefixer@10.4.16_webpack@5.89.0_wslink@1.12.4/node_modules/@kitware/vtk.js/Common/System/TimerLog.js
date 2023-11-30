function getUniversalTime() {
  return +new Date();
}
var vtkTimerLog = {
  getUniversalTime: getUniversalTime
};

export { vtkTimerLog as default, getUniversalTime };
