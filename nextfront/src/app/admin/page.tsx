"use client";

import { LogOut, Pencil, Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  state?: string;
  city?: string;
  createdAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função de logout
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Buscar usuários
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        // Filtra o usuário admin da lista
        setUsers(data.users.filter((user: User) => user.email !== "admin@abrasel.com"));
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  useEffect(() => {
    // Verificar se é admin
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user?.role || data.user.role !== "ADMIN") {
          router.push("/home");
        } else {
          setIsLoading(false);
          fetchUsers();
        }
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  // Deletar usuário
  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(users.filter(user => user.id !== id));
      } else {
        alert("Erro ao excluir usuário");
      }
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      alert("Erro ao excluir usuário");
    }
  };

  // Atualizar usuário
  const handleUpdate = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === user.id ? user : u));
        setEditingUser(null);
        setIsModalOpen(false);
      } else {
        alert("Erro ao atualizar usuário");
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      alert("Erro ao atualizar usuário");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-900 text-white grid place-items-center">
        <div>Carregando...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg transition"
          >
            <UserPlus size={20} />
            Novo Usuário
          </button>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="p-4">Nome</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Localização</th>
                <th className="p-4">Criado em</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4">
                    {user.city && user.state ? `${user.city}, ${user.state}` : "-"}
                  </td>
                  <td className="p-4">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition text-red-400"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botão de Logout */}
        <div className="flex justify-end mt-6 pb-8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
            title="Sair do sistema"
          >
            <LogOut size={20} />
            Sair do sistema
          </button>
        </div>
      </div>

      {/* Modal de Edição/Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-slate-800 p-6 rounded-xl w-[500px]">
            <h2 className="text-xl font-semibold mb-4">
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const userData = {
                  id: editingUser?.id,
                  name: formData.get("name") as string,
                  email: formData.get("email") as string,
                  role: formData.get("role") as string,
                  state: formData.get("state") as string,
                  city: formData.get("city") as string,
                  createdAt: editingUser?.createdAt || new Date().toISOString(),
                };

                if (editingUser) {
                  handleUpdate(userData as User);
                } else {
                  // Criar novo usuário
                  fetch("/api/admin/users", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userData),
                  })
                    .then((res) => {
                      if (res.ok) {
                        fetchUsers();
                        setIsModalOpen(false);
                      } else {
                        alert("Erro ao criar usuário");
                      }
                    })
                    .catch(() => {
                      alert("Erro ao criar usuário");
                    });
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm mb-1">Nome</label>
                <input
                  name="name"
                  defaultValue={editingUser?.name}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingUser?.email}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Role</label>
                <select
                  name="role"
                  defaultValue={editingUser?.role || "USER"}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-white/10"
                >
                  <option value="USER">Usuário</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Estado</label>
                  <input
                    name="state"
                    defaultValue={editingUser?.state}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Cidade</label>
                  <input
                    name="city"
                    defaultValue={editingUser?.city}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-white/10"
                  />
                </div>
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm mb-1">Senha</label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-white/10"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 transition"
                >
                  {editingUser ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
