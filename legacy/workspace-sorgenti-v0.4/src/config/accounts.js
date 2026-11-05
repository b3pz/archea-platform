// Ricostruito dal bundle fornito; comportamento originale conservato.

const ROLES = {
  architect: "Architect",
  senior_architect: "Senior Architect",
  partner_architect: "Partner Architect",
  property: "Property",
};
const DEMO_ACCOUNTS = [
  {
    id: "fdiamanti",
    nome: "Francesco Diamanti",
    ruolo: "responsabile",
    appRole: "partner_architect",
  },
  {
    id: "abotrini",
    nome: "Alessandro Botrini",
    ruolo: "membro",
    appRole: "senior_architect",
  },
  {
    id: "lleyra",
    nome: "Lisandro Leyra",
    ruolo: "membro",
    appRole: "architect",
  },
  { id: "property", nome: "ARCHEA Property", ruolo: "membro", appRole: "property", virtual: true },
];
export { ROLES, DEMO_ACCOUNTS };
