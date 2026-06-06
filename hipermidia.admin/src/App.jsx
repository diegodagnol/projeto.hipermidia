import { AdminContext, AdminUI, Resource } from 'react-admin';
import { HashRouter } from 'react-router-dom';
import authProvider from './authProvider';
import dataProvider from './dataProvider';
import { LocalList, LocalCreate, LocalEdit } from './resources/locais';
import { UsuarioList, UsuarioShow, UsuarioEdit } from './resources/usuarios';

const App = () => (
  <HashRouter>
    <AdminContext
      title="Explocus Admin"
      authProvider={authProvider}
      dataProvider={dataProvider}
    >
      <AdminUI>
        <Resource
          name="locais"
          list={LocalList}
          create={LocalCreate}
          edit={LocalEdit}
          options={{ label: 'Locais' }}
        />
        <Resource
          name="usuarios"
          list={UsuarioList}
          show={UsuarioShow}
          edit={UsuarioEdit}
          options={{ label: 'Usuários' }}
        />
      </AdminUI>
    </AdminContext>
  </HashRouter>
);

export default App;
