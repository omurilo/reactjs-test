import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";

import {
  getComicCharacters,
  getComics,
  getComicDetail,
  getCharacters,
} from "infrastructure/services/marvel";
import useIntersectionObserver from "application/hooks/useIntersectionObserver";

import Header from "ui/components/Header";
import { Container } from "ui/components/Container";
import Banner from "ui/components/Banner";
import { SectionTitle } from "ui/components/SectionTitle";
import SimpleCard from "ui/components/SimpleCard";
import { Card } from "ui/components/Card";
import Footer from "ui/components/Footer";
import { Loading } from "ui/components/Loading";

const CharacterComicsPage = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const [offset, setOffset] = React.useState(Number(props.offset));
  const [characters, setCharacters] = React.useState(props.characters);

  const observerRef = React.useRef(null);
  const observer = useIntersectionObserver(observerRef, { threshold: 0.33 });

  React.useEffect(() => {
    if (observer?.isIntersecting) {
      if (observer.intersectionRatio >= 0.33) {
        setOffset((past) => past + Number(props.limit));
      }
    }
  }, [observer, props.limit]);

  React.useEffect(() => {
    if (offset > props.offset) {
      if (offset < Number(props.total)) {
        getCharacters({ offset, limit: props.limit }).then((response) =>
          setCharacters((past) => [...past, ...response.results])
        );
      }
    }
  }, [offset, props.limit, props.total, props.offset]);

  return (
    <div>
      <Head>
        <title>Personagens que aparecem no quadrinho {props.comic.title}</title>
        <meta
          name="description"
          content={`Lista dos personagens que aparecem no quadrinho ${props.comic.title}.`}
        />
        <meta
          name="og:title"
          content={`Personagens que aparecem no quadrinho ${props.comic.title}`}
        />
        <meta
          name="og:description"
          content={`Lista dos personagens que aparecem no quadrinho ${props.comic.title}.`}
        />
        <meta name="og:type" content="article" />
        <meta name="og:site_name" content="Marvel Comics" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@marvel" />
        <meta
          name="twitter:title"
          content={`Personagens que aparecem no quadrinho ${props.comic.title}`}
        />
        <meta
          name="twitter:description"
          content={`Lista dos personagens que aparecem no quadrinho ${props.comic.title}.`}
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
          <SectionTitle>Personagens</SectionTitle>
          <div>
            {characters.map((character) => (
              <SimpleCard.Container key={character.id}>
                <Link
                  passHref
                  href="/characters/:title/:id"
                  as={`/characters/${character.name?.replace(
                    /[^-a-zA-Z0-9]+/g,
                    ""
                  )}/${character.id}`}
                >
                  <Card.Link>
                    <SimpleCard.Image
                      src={`${character.thumbnail!.path}/portrait_fantastic.${
                        character.thumbnail!.extension
                      }`}
                      alt={character.name}
                      width="168"
                      height="252"
                    />
                    <SimpleCard.Title>{character.name}</SimpleCard.Title>
                  </Card.Link>
                </Link>
              </SimpleCard.Container>
            ))}
          </div>
          <div style={{ width: "100%", marginTop: "2rem" }} ref={observerRef}>
            {offset <= props.total && observer?.isIntersecting && <Loading />}
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

  const { id } = params as { id: string };

  const response = await getComicCharacters({ id, limit: 14 });

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
      characters: response.results,
      limit: response.limit,
      offset: response.offset,
      total: response.total,
    },
    revalidate: 24 * 60 * 60,
  };
};

export default CharacterComicsPage;
