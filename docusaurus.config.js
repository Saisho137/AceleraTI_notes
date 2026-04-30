// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'AceleraTI — Notas',
  tagline: 'Notas del programa AceleraTI · Bancolombia & Pragma · Java Backend',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  markdown: {
    mermaid: true,
    format: 'md',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  url: 'https://saisho137.github.io',
  baseUrl: '/AceleraTI_notes/',

  organizationName: 'Saisho137',
  projectName: 'AceleraTI_notes',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'notas',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'AceleraTI — Notas',
        logo: {
          alt: 'AceleraTI Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'notas',
            position: 'left',
            label: 'Notas de Clase',
          },
          {
            href: 'https://github.com/Saisho137/AceleraTI_notes',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Módulos',
            items: [
              {label: 'Introducción al Proyecto', to: '/notas/clase-01-introduccion-al-proyecto'},
              {label: 'Java', to: '/notas/clase-02-java'},
              {label: 'Clean Architecture', to: '/notas/clase-06-arquitectura-limpia-clean-architecture'},
              {label: 'DDD', to: '/notas/clase-13-domain-driven-design-ddd'},
            ],
          },
          {
            title: 'Stack del Curso',
            items: [
              {label: 'Java 21', href: 'https://openjdk.org/projects/jdk/21/'},
              {label: 'Spring Boot', href: 'https://spring.io/projects/spring-boot'},
              {label: 'Bancolombia Scaffold', href: 'https://github.com/bancolombia/scaffold-clean-architecture'},
            ],
          },
          {
            title: 'Programa',
            items: [
              {label: 'AceleraTI', href: 'https://github.com/Saisho137/AceleraTI_notes'},
              {label: 'Arka Docs', href: 'https://saisho137.github.io/arka-docs/'},
              {label: 'Docusaurus', href: 'https://docusaurus.io/'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Santiago Betancur · AceleraTI. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['java', 'groovy', 'bash', 'json', 'yaml', 'sql', 'docker'],
      },
    }),
};

export default config;
