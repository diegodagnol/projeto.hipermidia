import { Admin, Resource, ListGuesser } from 'react-admin';
import authProvider from './authProvider';
import dataProvider from './dataProvider';
import { LocalList, LocalCreate, LocalEdit } from './resources/locais';
import { UsuarioList, UsuarioShow, UsuarioEdit } from './resources/usuarios';

const App = () => (
  <Admin
    title="Explocus Admin"
    authProvider={authProvider}
    dataProvider={dataProvider}
    basename="/admin"
  >
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
  </Admin>
);

export default App;
