import { useEffect, useState } from "react";
import { api } from "../api/api";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from "@mui/material";

export default function TransactionModal({ open, onClose, onCreated }) {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState("EXPENSE");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Carrega contas e categorias quando o modal abre
  useEffect(() => {
    if (!open) return;

    async function load() {
      try {
        const [accResp, catResp] = await Promise.all([
          api.get("/accounts"),
          api.get("/categories"),
        ]);

        setAccounts(accResp.data);

        const today = new Date().toISOString().slice(0, 10);
        if (!date) setDate(today);

        // Filtra categorias pelo tipo atual
        const filteredCats = catResp.data.filter((c) => c.type === type);
        setCategories(filteredCats);

        if (accResp.data.length > 0 && !accountId) {
          setAccountId(accResp.data[0].id);
        }

        if (filteredCats.length > 0 && !categoryId) {
          setCategoryId(filteredCats[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, [open]);

  // Quando muda o tipo, filtra categorias de novo
  useEffect(() => {
    async function loadCatsByType() {
      try {
        const resp = await api.get("/categories");
        const filtered = resp.data.filter((c) => c.type === type);
        setCategories(filtered);
        if (filtered.length > 0) {
          setCategoryId(filtered[0].id);
        } else {
          setCategoryId("");
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (open) {
      loadCatsByType();
    }
  }, [type, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/transactions", {
        account_id: accountId,
        category_id: categoryId || null,
        type,
        amount: Number(amount),
        description,
        date,
      });

      setLoading(false);
      onCreated && onCreated();
      handleClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Erro ao criar transação");
    }
  }

  function handleClose() {
    // limpa alguns campos, mas mantém tipo e data (bem app real mesmo)
    setAmount("");
    setDescription("");
    onClose();
  }

  function handleTypeChange(_event, newType) {
    if (!newType) return; // evita ficar undefined
    setType(newType);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Nova transação</DialogTitle>

      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1 }}
        >
          {/* Toggle Receita/Despesa */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: "block" }}
            >
              Tipo
            </Typography>
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={handleTypeChange}
              size="small"
            >
              <ToggleButton value="INCOME">Receita</ToggleButton>
              <ToggleButton value="EXPENSE">Despesa</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Conta / Categoria */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
              mb: 2,
            }}
          >
            <TextField
              select
              label="Conta"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              fullWidth
            >
              {accounts.map((acc) => (
                <MenuItem key={acc.id} value={acc.id}>
                  {acc.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Categoria"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              fullWidth
              helperText={
                categories.length === 0
                  ? "Nenhuma categoria cadastrada para esse tipo"
                  : ""
              }
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Valor / Data */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
              mb: 2,
            }}
          >
            <TextField
              label="Valor"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Data"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            placeholder="Ex: Mercado, aluguel, salário..."
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
