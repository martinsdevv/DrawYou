package com.drawyou.dao;

import com.drawyou.model.NoFluxograma;
import com.drawyou.util.HibernateUtil;
import java.util.List;
import java.util.Optional;
import org.hibernate.Session;
import org.hibernate.Transaction;

public class NoFluxogramaDAO {

    public List<NoFluxograma> listarTodos() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session
                    .createQuery("FROM NoFluxograma n ORDER BY n.id", NoFluxograma.class)
                    .list();
        }
    }

    public Optional<NoFluxograma> buscarPorId(Long id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return Optional.ofNullable(session.get(NoFluxograma.class, id));
        }
    }

    public NoFluxograma salvar(NoFluxograma no) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            session.persist(no);
            transaction.commit();
            return no;
        } catch (RuntimeException exception) {
            rollbackQuietly(transaction);
            throw exception;
        }
    }

    public NoFluxograma atualizar(NoFluxograma no) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();
            NoFluxograma atualizado = session.merge(no);
            transaction.commit();
            return atualizado;
        } catch (RuntimeException exception) {
            rollbackQuietly(transaction);
            throw exception;
        }
    }

    public boolean excluir(Long id) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            NoFluxograma no = session.get(NoFluxograma.class, id);
            if (no == null) {
                return false;
            }

            transaction = session.beginTransaction();
            session.remove(no);
            transaction.commit();
            return true;
        } catch (RuntimeException exception) {
            rollbackQuietly(transaction);
            throw exception;
        }
    }

    public long contarPorStatus(String status) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Long total = session
                    .createQuery(
                            "SELECT COUNT(n.id) FROM NoFluxograma n WHERE n.status = :status",
                            Long.class
                    )
                    .setParameter("status", status)
                    .uniqueResult();
            return total != null ? total : 0L;
        }
    }

    public long contarTotal() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            Long total = session
                    .createQuery("SELECT COUNT(n.id) FROM NoFluxograma n", Long.class)
                    .uniqueResult();
            return total != null ? total : 0L;
        }
    }

    private void rollbackQuietly(Transaction transaction) {
        if (transaction != null && transaction.isActive()) {
            transaction.rollback();
        }
    }
}
