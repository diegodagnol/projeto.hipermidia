import { AdminContext, AdminUI, Resource } from 'react-admin';
import { HashRouter } from 'react-router-dom';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import authProvider from './authProvider';
import dataProvider from './dataProvider';

const i18nProvider = polyglotI18nProvider(() => englishMessages, 'en');
import { LocalList, LocalCreate, LocalEdit } from './resources/locais';
import { UsuarioList, UsuarioShow, UsuarioEdit } from './resources/usuarios';

const App = () => (
  <HashRouter>
    <AdminContext
      title="Explocus Admin"
      authProvider={authProvider}
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
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
