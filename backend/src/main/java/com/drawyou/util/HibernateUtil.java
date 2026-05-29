package com.drawyou.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public final class HibernateUtil {

    private static final SessionFactory SESSION_FACTORY = buildSessionFactory();

    private HibernateUtil() {
    }

    private static SessionFactory buildSessionFactory() {
        try {
            Configuration configuration = new Configuration().configure();
            carregarPropriedades(configuration);
            return configuration.buildSessionFactory();
        } catch (Exception exception) {
            IllegalStateException erro = new IllegalStateException(
                    "Falha ao inicializar o Hibernate. Verifique hibernate.properties e o PostgreSQL.",
                    exception
            );
            throw new ExceptionInInitializerError(erro);
        }
    }

    private static void carregarPropriedades(Configuration configuration) throws IOException {
        try (InputStream input = HibernateUtil.class.getClassLoader().getResourceAsStream("hibernate.properties")) {
            if (input == null) {
                throw new IllegalStateException(
                        "Arquivo hibernate.properties nao encontrado. "
                                + "Copie hibernate.properties.example e configure usuario/senha."
                );
            }

            Properties propriedades = new Properties();
            propriedades.load(input);
            configuration.addProperties(propriedades);
        }
    }

    public static SessionFactory getSessionFactory() {
        return SESSION_FACTORY;
    }
}
