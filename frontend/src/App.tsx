import React from 'react';
import ConfigRoutes from './routes/mainroutes';
import { ContextProvider } from "./contexts/ContextProvider"
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1JEaF5cXmRCeUx0Rnxbf1x1ZFZMYV5bRXdPMyBoS35Rc0VkWHlec3VXR2FUWEBxVEFd');


const App: React.FC = () => {
  return (
    <ContextProvider>
      <div className="App">
        <ConfigRoutes />
      </div>
    </ContextProvider>
  );
};

export default App;
