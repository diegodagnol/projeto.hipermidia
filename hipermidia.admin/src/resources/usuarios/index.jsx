import {
  List, Datagrid, TextField, DateField,
  Edit, SimpleForm, TextInput,
  Show, SimpleShowLayout,
  required, maxLength,
} from 'react-admin';

export const UsuarioList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" label="ID" />
      <TextField source="nome" label="Nome" />
      <TextField source="email" label="E-mail" />
      <TextField source="usuario" label="Usuário" />
      <DateField source="created_at" label="Cadastrado em" showTime />
    </Datagrid>
  </List>
);

export const UsuarioShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="nome" label="Nome" />
      <TextField source="email" label="E-mail" />
      <TextField source="usuario" label="Usuário" />
      <DateField source="created_at" label="Cadastrado em" showTime />
      <DateField source="updated_at" label="Atualizado em" showTime />
    </SimpleShowLayout>
  </Show>
);

export const UsuarioEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput
        source="nome" label="Nome" fullWidth
        validate={[required('Nome é obrigatório'), maxLength(255)]}
      />
      <TextInput
        source="email" label="E-mail" fullWidth type="email"
        validate={[required('E-mail é obrigatório')]}
      />
      <TextInput
        source="usuario" label="Usuário" fullWidth
        validate={[required('Usuário é obrigatório'), maxLength(100)]}
      />
    </SimpleForm>
  </Edit>
);
