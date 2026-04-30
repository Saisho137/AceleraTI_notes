import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/notas/intro">
            Ver Notas de Clase →
          </Link>
        </div>
      </div>
    </header>
  );
}

const modules = [
  {
    title: 'Fundamentos',
    items: ['Java', 'HTTP & REST', 'Bases de Datos SQL & NoSQL', 'Pruebas Unitarias'],
  },
  {
    title: 'Arquitectura',
    items: ['Clean Architecture', 'Arquitectura Hexagonal', 'Domain Driven Design', 'Microservicios'],
  },
  {
    title: 'Ecosistema Spring',
    items: ['Spring Data JPA', 'Spring Boot', 'Spring Cloud', 'Docker & AWS'],
  },
];

function ModuleCard({title, items}) {
  return (
    <div className={clsx('col col--4', styles.moduleCard)}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Notas del programa AceleraTI — Java Backend con Spring Boot, Clean Architecture y más">
      <HomepageHeader />
      <main>
        <section className={styles.modules}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Módulos del Programa</h2>
            <div className="row">
              {modules.map((m) => (
                <ModuleCard key={m.title} {...m} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
