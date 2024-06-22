ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:G2jS2PD6sKKVu7rXfyt8cg==$vhMS8rx7/NBLLyAVioQXJHSP735weQr69mxsJ5gMQkU=:Gj5/ieMtdnIObboc07LqKGmjBYu+TCysTdDTrUhQ2PA=';

--
-- Database "testdb" dump
--

--
-- Name: testdb; Type: DATABASE; Schema: -; Owner: postgres
--

-- CREATE DATABASE testdb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE testdb OWNER TO postgres;

\connect testdb

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: test_db; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_db (
    id integer NOT NULL,
    blabla integer NOT NULL,
    blibli integer NOT NULL
);


ALTER TABLE public.test_db OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    description text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: test_db; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_db (id, blabla, blibli) FROM stdin;
1	123	456
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, description) FROM stdin;
1	admin	admin	description admin blabla
2	user	user	user descption here
\.
