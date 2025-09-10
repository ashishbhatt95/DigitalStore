import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Head from "./partials/Head";
import Header from "./partials/Header";
import LeftSidebar from "./partials/LeftSidebar";

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "Blocked" ? "Active" : "Blocked";
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setUsers(users.map(user =>
        user.id === id ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update user status");
    }
  };

  if (loading) {
    return (
      <>
        <Head />
        <Header />
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head />
        <Header />
        <div className="alert alert-danger text-center mt-5">
          Error: {error}
        </div>
      </>
    );
  }

  return (
    <>
      <Head />
      <Header />
      <section id="mid">
        <div className="container-fluid">
          <div className="row">
            <LeftSidebar />
            <div className="col-md-9 p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">USER MANAGEMENT</h2>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Sr. No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user, index) => (
                        <tr key={user.id}>
                          <td>{index + 1}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`badge ${user.status === "Active" ? "bg-success" : "bg-danger"}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm ${user.status === "Blocked" ? "btn-success" : "btn-danger"}`}
                              onClick={() => toggleStatus(user.id, user.status)}
                            >
                              {user.status === "Blocked" ? "Unblock" : "Block"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UserManage;