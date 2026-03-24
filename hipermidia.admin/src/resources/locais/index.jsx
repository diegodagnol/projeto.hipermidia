import {
  List, Datagrid, TextField, NumberField,
  Create, Edit, SimpleForm,
  TextInput, NumberInput,
  required, minLength, maxLength, minValue, maxValue,
  Show, SimpleShowLayout,
} from 'react-admin';

export const LocalList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="nome" label="Nome" />
      <TextField source="descricao" label="Descrição" />
      <NumberField source="latitude" label="Latitude" />
      <NumberField source="longitude" label="Longitude" />
      <TextField source="foto_url" label="Foto URL" />
    </Datagrid>
  </List>
);

const LocalForm = () => (
  <SimpleForm>
    <TextInput
      source="nome" label="Nome" fullWidth
      validate={[required('Nome é obrigatório'), maxLength(255)]}
    />
    <TextInput
      source="descricao" label="Descrição" fullWidth multiline rows={3}
      validate={[required('Descrição é obrigatória'), maxLength(1000)]}
    />
    <TextInput
      source="conteudo" label="Conteúdo (HTML)" fullWidth multiline rows={8}
    />
    <NumberInput
      source="latitude" label="Latitude"
      validate={[required('Latitude é obrigatória'), minValue(-90), maxValue(90)]}
    />
    <NumberInput
      source="longitude" label="Longitude"
      validate={[required('Longitude é obrigatória'), minValue(-180), maxValue(180)]}
    />
    <TextInput
      source="foto_url" label="URL da Foto" fullWidth
      validate={[maxLength(500)]}
    />
  </SimpleForm>
);

export const LocalCreate = () => (
  <Create>
    <LocalForm />
  </Create>
);

export const LocalEdit = () => (
  <Edit>
    <LocalForm />
  </Edit>
);
