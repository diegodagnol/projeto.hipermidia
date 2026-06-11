import {
  List, Datagrid, TextField, EmailField,
  BooleanField, DateField, Show, SimpleShowLayout,
  useRecordContext, useUpdate, Button,
} from 'react-admin';
import CheckIcon from '@mui/icons-material/Check';

const MarcarLidoButton = () => {
  const record = useRecordContext();
  const [update, { isPending }] = useUpdate();

  if (record?.lido) return null;

  return (
    <Button
      label="Marcar como lido"
      onClick={(e) => {
        e.stopPropagation();
        update('mensagens', { id: record.id, data: { lido: true }, previousData: record });
      }}
      disabled={isPending}
      startIcon={<CheckIcon />}
    />
  );
};

export const MensagemList = () => (
  <List sort={{ field: 'criado_em', order: 'DESC' }}>
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="nome" label="Nome" />
      <EmailField source="email" label="E-mail" />
      <TextField source="assunto" label="Assunto" />
      <DateField source="criado_em" label="Recebida em" showTime />
      <BooleanField source="lido" label="Lido" />
      <MarcarLidoButton />
    </Datagrid>
  </List>
);

export const MensagemShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="nome" label="Nome" />
      <EmailField source="email" label="E-mail" />
      <TextField source="assunto" label="Assunto" />
      <TextField source="mensagem" label="Mensagem" />
      <DateField source="criado_em" label="Recebida em" showTime />
      <BooleanField source="lido" label="Lido" />
    </SimpleShowLayout>
  </Show>
);
