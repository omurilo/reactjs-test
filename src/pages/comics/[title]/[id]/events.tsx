import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import * as React from "react";

import {
  getComicDetail,
  getComicEvents,
  getComics,
} from "infrastructure/services/marvel";

import Header from "ui/components/Header";
import { Container } from "ui/components/Container";
import Banner from "ui/components/Banner";
import { SectionTitle } from "ui/components/SectionTitle";
import SimpleCard from "ui/components/SimpleCard";
import { Card } from "ui/components/Card";
import Footer from "ui/components/Footer";

const CharacterEventsPage = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  return (
    <div>
      <Head>
        <title>Eventos que acontecem no quadrinho {props.comic.title}</title>
        <meta
          name="description"
          content={`Lista dos eventos que acontecem no quadrinho ${props.comic.title}`}
        />
        <meta
          name="og:title"
          content={`Eventos que acontecem no quadrinho ${props.comic.title}`}
        />
        <meta
          name="og:description"
          content={`Lista dos eventos que acontecem no quadrinho ${props.comic.title}.`}
        />
        <meta name="og:type" content="article" />
        <meta name="og:site_name" content="Marvel Comics" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@marvel" />
        <meta
          name="twitter:title"
          content={`Eventos que acontecem no quadrinho ${props.comic.title}`}
        />
        <meta
          name="twitter:description"
          content={`Lista dos eventos que acontecem no quadrinho ${props.comic.title}.`}
        />
      </Head>
      <main>
        <Header />
        <Container $bgColor="black">
          <Banner.Container>
            <figure>
              <Image
                src={`${props.comic.thumbnail.path}/portrait_uncanny.${props.comic.thumbnail.extension}`}
                alt={props.comic.title}
                layout="fill"
                objectFit="fill"
              />
            </figure>
            <Banner.Info>
              <Banner.Title>{props.comic.title}</Banner.Title>
              {props.comic.description && (
                <Banner.Description
                  dangerouslySetInnerHTML={{
                    __html: props.comic.description,
                  }}
                />
              )}
            </Banner.Info>
          </Banner.Container>
        </Container>
        <Container>
          <SectionTitle>Eventos</SectionTitle>
          <div>
            {props.events.map((event) => (
              <SimpleCard.Container key={event.id}>
                <Link
                  passHref
                  href="/events/:title/:id"
                  as={`/events/${event.title?.replace(/[^-a-zA-Z0-9]+/g, "")}/${
                    event.id
                  }`}
                >
                  <Card.Link>
                    <SimpleCard.Image
                      src={`${event.thumbnail!.path}/portrait_fantastic.${
                        event.thumbnail!.extension
                      }`}
                      alt={event.title}
                      width="168"
                      height="252"
                    />
                    <SimpleCard.Title>{event.title}</SimpleCard.Title>
                  </Card.Link>
                </Link>
              </SimpleCard.Container>
            ))}
          </div>
        </Container>
        <Footer />
      </main>
    </div>
  );
};

export const getStaticPaths = async () => {
  const response = await getComics({ limit: 14 });

  const paths = response.results.map((comic) => ({
    params: {
      id: String(comic.id),
      title: comic.title.replace(/[^a-zA-Z0-9]+/g, ""),
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const { params } = context;

  const { id } = params as { id: string; title: string };

  const response = await getComicEvents({ id });

  const {
    results: [{ title, description, thumbnail }],
  } = await getComicDetail({ id });

  const comic = {
    title,
    description: description || null,
    thumbnail,
  };

  return {
    props: {
      comic,
      events: response.results,
    },
    revalidate: 24 * 60 * 60,
  };
};

export default CharacterEventsPage;
