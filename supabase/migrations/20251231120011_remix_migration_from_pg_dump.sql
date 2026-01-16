CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: increment_conversions(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.increment_conversions(link_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE payment_links
  SET conversions = conversions + 1
  WHERE id = link_id;
END;
$$;


--
-- Name: increment_tracking_conversions(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.increment_tracking_conversions(link_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE tracking_links
  SET conversions = conversions + 1
  WHERE id = link_id;
END;
$$;


--
-- Name: increment_tracking_visits(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.increment_tracking_visits(link_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE tracking_links
  SET visits = visits + 1
  WHERE id = link_id;
END;
$$;


--
-- Name: increment_views(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.increment_views(link_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  UPDATE payment_links
  SET views = views + 1
  WHERE id = link_id;
END;
$$;


--
-- Name: update_merchant_balance_on_payment(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_merchant_balance_on_payment() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    UPDATE merchants
    SET available_balance = COALESCE(available_balance, 0) + NEW.amount
    WHERE id = NEW.merchant_id;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: ad_rewards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.ad_rewards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    merchant_id uuid NOT NULL,
    ad_type text NOT NULL,
    ad_id text NOT NULL,
    reward_amount numeric DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    merchant_id uuid NOT NULL,
    key_hash text NOT NULL,
    key_prefix text NOT NULL,
    name text NOT NULL,
    last_used_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: checkout_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.checkout_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    transaction_id uuid,
    payment_link_id uuid,
    responses jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: merchants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.merchants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pi_user_id text NOT NULL,
    pi_username text,
    business_name text,
    business_logo text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    wallet_address text,
    available_balance numeric DEFAULT 0,
    total_withdrawn numeric DEFAULT 0,
    is_admin boolean DEFAULT false
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    merchant_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    related_id uuid,
    related_type text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payment_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.payment_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    merchant_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    amount numeric(20,7) NOT NULL,
    currency text DEFAULT 'Pi'::text NOT NULL,
    slug text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    payment_type text DEFAULT 'one_time'::text NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    conversions integer DEFAULT 0 NOT NULL,
    redirect_url text,
    content_file text,
    access_type text DEFAULT 'instant'::text,
    platform_fee_paid boolean DEFAULT false,
    platform_fee_amount numeric DEFAULT 1,
    platform_fee_txid text,
    pricing_type text DEFAULT 'one_time'::text,
    expire_access text DEFAULT 'never'::text,
    stock integer,
    is_unlimited_stock boolean DEFAULT true,
    show_on_store boolean DEFAULT false,
    free_trial boolean DEFAULT false,
    free_trial_days integer DEFAULT 0,
    enable_split_pay boolean DEFAULT false,
    discount_on_cancel boolean DEFAULT false,
    discount_percent integer DEFAULT 0,
    enable_waitlist boolean DEFAULT false,
    ask_questions boolean DEFAULT false,
    checkout_questions jsonb DEFAULT '[]'::jsonb,
    internal_name text,
    min_amount numeric,
    suggested_amounts numeric[],
    CONSTRAINT payment_links_payment_type_check CHECK ((payment_type = ANY (ARRAY['one_time'::text, 'recurring'::text, 'checkout'::text]))),
    CONSTRAINT payment_links_pricing_type_check CHECK ((pricing_type = ANY (ARRAY['free'::text, 'one_time'::text, 'recurring'::text, 'donation'::text])))
);


--
-- Name: platform_fees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.platform_fees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    merchant_id uuid NOT NULL,
    payment_link_id uuid,
    amount numeric DEFAULT 1 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    txid text,
    pi_payment_id text,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    amount numeric NOT NULL,
    "interval" text DEFAULT 'monthly'::text NOT NULL,
    features jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    link_limit integer,
    analytics_level text DEFAULT 'basic'::text,
    platform_fee_percent numeric DEFAULT 1
);


--
-- Name: tracking_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.tracking_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tracking_link_id uuid NOT NULL,
    event_type text DEFAULT 'visit'::text NOT NULL,
    user_agent text,
    device_type text,
    referrer text,
    ip_hash text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: tracking_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.tracking_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    merchant_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    destination_url text NOT NULL,
    tracking_code text,
    is_active boolean DEFAULT true,
    visits integer DEFAULT 0,
    conversions integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    merchant_id uuid NOT NULL,
    payment_link_id uuid,
    pi_payment_id text NOT NULL,
    payer_pi_username text,
    amount numeric(20,7) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    memo text,
    metadata jsonb DEFAULT '{}'::jsonb,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    txid text,
    blockchain_verified boolean DEFAULT false NOT NULL,
    sender_address text,
    receiver_address text,
    buyer_email text,
    email_sent boolean DEFAULT false
);


--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pi_username text NOT NULL,
    plan_id uuid,
    payment_link_id uuid,
    status text DEFAULT 'active'::text,
    started_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    last_payment_at timestamp with time zone,
    merchant_id uuid,
    current_period_start timestamp with time zone DEFAULT now(),
    current_period_end timestamp with time zone
);


--
-- Name: waitlist_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.waitlist_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_link_id uuid,
    email text NOT NULL,
    pi_username text,
    created_at timestamp with time zone DEFAULT now(),
    notified boolean DEFAULT false,
    notified_at timestamp with time zone
);


--
-- Name: webhooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.webhooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    merchant_id uuid NOT NULL,
    url text NOT NULL,
    events text[] DEFAULT ARRAY['payment.completed'::text],
    is_active boolean DEFAULT true,
    secret text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: withdrawals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.withdrawals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    merchant_id uuid NOT NULL,
    amount numeric NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    txid text,
    pi_payment_id text,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    notes text,
    wallet_address text,
    pi_username text,
    withdrawal_type text DEFAULT 'manual'::text,
    CONSTRAINT withdrawals_withdrawal_type_check CHECK ((withdrawal_type = ANY (ARRAY['manual'::text, 'a2u'::text])))
);


--
-- Name: ad_rewards ad_rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_rewards
    DROP CONSTRAINT IF EXISTS ad_rewards_pkey;

ALTER TABLE ONLY public.ad_rewards
    ADD CONSTRAINT ad_rewards_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_key_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    DROP CONSTRAINT IF EXISTS api_keys_key_hash_key;

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_hash_key UNIQUE (key_hash);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    DROP CONSTRAINT IF EXISTS api_keys_pkey;

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: checkout_responses checkout_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkout_responses
    DROP CONSTRAINT IF EXISTS checkout_responses_pkey;

ALTER TABLE ONLY public.checkout_responses
    ADD CONSTRAINT checkout_responses_pkey PRIMARY KEY (id);


--
-- Name: merchants merchants_pi_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.merchants
    DROP CONSTRAINT IF EXISTS merchants_pi_user_id_key;

ALTER TABLE ONLY public.merchants
    ADD CONSTRAINT merchants_pi_user_id_key UNIQUE (pi_user_id);


--
-- Name: merchants merchants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.merchants
    DROP CONSTRAINT IF EXISTS merchants_pkey;

ALTER TABLE ONLY public.merchants
    ADD CONSTRAINT merchants_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    DROP CONSTRAINT IF EXISTS notifications_pkey;

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payment_links payment_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_links
    DROP CONSTRAINT IF EXISTS payment_links_pkey;

ALTER TABLE ONLY public.payment_links
    ADD CONSTRAINT payment_links_pkey PRIMARY KEY (id);


--
-- Name: payment_links payment_links_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_links
    DROP CONSTRAINT IF EXISTS payment_links_slug_key;

ALTER TABLE ONLY public.payment_links
    ADD CONSTRAINT payment_links_slug_key UNIQUE (slug);


--
-- Name: platform_fees platform_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_fees
    DROP CONSTRAINT IF EXISTS platform_fees_pkey;

ALTER TABLE ONLY public.platform_fees
    ADD CONSTRAINT platform_fees_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    DROP CONSTRAINT IF EXISTS subscription_plans_pkey;

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: tracking_events tracking_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracking_events
    DROP CONSTRAINT IF EXISTS tracking_events_pkey;

ALTER TABLE ONLY public.tracking_events
    ADD CONSTRAINT tracking_events_pkey PRIMARY KEY (id);


--
-- Name: tracking_links tracking_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracking_links
    DROP CONSTRAINT IF EXISTS tracking_links_pkey;

ALTER TABLE ONLY public.tracking_links
    ADD CONSTRAINT tracking_links_pkey PRIMARY KEY (id);


--
-- Name: tracking_links tracking_links_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracking_links
    DROP CONSTRAINT IF EXISTS tracking_links_slug_key;

ALTER TABLE ONLY public.tracking_links
    ADD CONSTRAINT tracking_links_slug_key UNIQUE (slug);


--
-- Name: transactions transactions_pi_payment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    DROP CONSTRAINT IF EXISTS transactions_pi_payment_id_key;

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pi_payment_id_key UNIQUE (pi_payment_id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    DROP CONSTRAINT IF EXISTS transactions_pkey;

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    DROP CONSTRAINT IF EXISTS user_subscriptions_pkey;

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: waitlist_entries waitlist_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_entries
    DROP CONSTRAINT IF EXISTS waitlist_entries_pkey;

ALTER TABLE ONLY public.waitlist_entries
    ADD CONSTRAINT waitlist_entries_pkey PRIMARY KEY (id);


--
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhooks
    DROP CONSTRAINT IF EXISTS webhooks_pkey;

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    DROP CONSTRAINT IF EXISTS withdrawals_pkey;

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions_merchant_id_unique; Type: INDEX; Schema: public; Owner: -
--

DROP INDEX IF EXISTS user_subscriptions_merchant_id_unique;

CREATE UNIQUE INDEX user_subscriptions_merchant_id_unique ON public.user_subscriptions USING btree (merchant_id) WHERE (merchant_id IS NOT NULL);


--
-- Name: transactions update_balance_on_transaction; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_balance_on_transaction AFTER INSERT OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_merchant_balance_on_payment();


--
-- Name: merchants update_merchants_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON public.merchants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: payment_links update_payment_links_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payment_links_updated_at BEFORE UPDATE ON public.payment_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: ad_rewards ad_rewards_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_rewards
    DROP CONSTRAINT IF EXISTS ad_rewards_merchant_id_fkey;

ALTER TABLE ONLY public.ad_rewards
    ADD CONSTRAINT ad_rewards_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    DROP CONSTRAINT IF EXISTS api_keys_merchant_id_fkey;

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id) ON DELETE CASCADE;


--
-- Name: checkout_responses checkout_responses_payment_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkout_responses
    DROP CONSTRAINT IF EXISTS checkout_responses_payment_link_id_fkey;

ALTER TABLE ONLY public.checkout_responses
    ADD CONSTRAINT checkout_responses_payment_link_id_fkey FOREIGN KEY (payment_link_id) REFERENCES public.payment_links(id) ON DELETE CASCADE;


--
-- Name: checkout_responses checkout_responses_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkout_responses
    DROP CONSTRAINT IF EXISTS checkout_responses_transaction_id_fkey;

ALTER TABLE ONLY public.checkout_responses
    ADD CONSTRAINT checkout_responses_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    DROP CONSTRAINT IF EXISTS notifications_merchant_id_fkey;

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id) ON DELETE CASCADE;


--
-- Name: payment_links payment_links_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_links
    DROP CONSTRAINT IF EXISTS payment_links_merchant_id_fkey;

ALTER TABLE ONLY public.payment_links
    ADD CONSTRAINT payment_links_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id) ON DELETE CASCADE;


--
-- Name: platform_fees platform_fees_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_fees
    DROP CONSTRAINT IF EXISTS platform_fees_merchant_id_fkey;

ALTER TABLE ONLY public.platform_fees
    ADD CONSTRAINT platform_fees_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id);


--
-- Name: platform_fees platform_fees_payment_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_fees
    DROP CONSTRAINT IF EXISTS platform_fees_payment_link_id_fkey;

ALTER TABLE ONLY public.platform_fees
    ADD CONSTRAINT platform_fees_payment_link_id_fkey FOREIGN KEY (payment_link_id) REFERENCES public.payment_links(id);


--
-- Name: tracking_events tracking_events_tracking_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracking_events
    DROP CONSTRAINT IF EXISTS tracking_events_tracking_link_id_fkey;

ALTER TABLE ONLY public.tracking_events
    ADD CONSTRAINT tracking_events_tracking_link_id_fkey FOREIGN KEY (tracking_link_id) REFERENCES public.tracking_links(id) ON DELETE CASCADE;


--
-- Name: tracking_links tracking_links_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracking_links
    DROP CONSTRAINT IF EXISTS tracking_links_merchant_id_fkey;

ALTER TABLE ONLY public.tracking_links
    ADD CONSTRAINT tracking_links_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    DROP CONSTRAINT IF EXISTS transactions_merchant_id_fkey;

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_payment_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    DROP CONSTRAINT IF EXISTS transactions_payment_link_id_fkey;

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_payment_link_id_fkey FOREIGN KEY (payment_link_id) REFERENCES public.payment_links(id) ON DELETE SET NULL;


--
-- Name: user_subscriptions user_subscriptions_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    DROP CONSTRAINT IF EXISTS user_subscriptions_merchant_id_fkey;

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id);


--
-- Name: user_subscriptions user_subscriptions_payment_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    DROP CONSTRAINT IF EXISTS user_subscriptions_payment_link_id_fkey;

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_payment_link_id_fkey FOREIGN KEY (payment_link_id) REFERENCES public.payment_links(id);


--
-- Name: user_subscriptions user_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: waitlist_entries waitlist_entries_payment_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_entries
    DROP CONSTRAINT IF EXISTS waitlist_entries_payment_link_id_fkey;

ALTER TABLE ONLY public.waitlist_entries
    ADD CONSTRAINT waitlist_entries_payment_link_id_fkey FOREIGN KEY (payment_link_id) REFERENCES public.payment_links(id) ON DELETE CASCADE;


--
-- Name: webhooks webhooks_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhooks
    DROP CONSTRAINT IF EXISTS webhooks_merchant_id_fkey;

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id) ON DELETE CASCADE;


--
-- Name: withdrawals withdrawals_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    DROP CONSTRAINT IF EXISTS withdrawals_merchant_id_fkey;

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id);


--
-- Name: withdrawals Admins can update all withdrawals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all withdrawals" ON public.withdrawals FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.merchants
  WHERE ((merchants.id = ( SELECT merchants_1.id
           FROM public.merchants merchants_1
          WHERE (merchants_1.pi_user_id = (auth.uid())::text)
         LIMIT 1)) AND (merchants.is_admin = true)))));


--
-- Name: withdrawals Admins can view all withdrawals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all withdrawals" ON public.withdrawals FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.merchants
  WHERE ((merchants.id = ( SELECT merchants_1.id
           FROM public.merchants merchants_1
          WHERE (merchants_1.pi_user_id = (auth.uid())::text)
         LIMIT 1)) AND (merchants.is_admin = true)))));


--
-- Name: merchants Anyone can create merchant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create merchant" ON public.merchants FOR INSERT WITH CHECK (true);


--
-- Name: platform_fees Anyone can create platform fees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create platform fees" ON public.platform_fees FOR INSERT WITH CHECK (true);


--
-- Name: user_subscriptions Anyone can create subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create subscriptions" ON public.user_subscriptions FOR INSERT WITH CHECK (true);


--
-- Name: transactions Anyone can create transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create transactions" ON public.transactions FOR INSERT WITH CHECK (true);


--
-- Name: ad_rewards Anyone can insert ad rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert ad rewards" ON public.ad_rewards FOR INSERT WITH CHECK (true);


--
-- Name: notifications Anyone can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);


--
-- Name: tracking_events Anyone can insert tracking events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert tracking events" ON public.tracking_events FOR INSERT WITH CHECK (true);


--
-- Name: waitlist_entries Anyone can join waitlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can join waitlist" ON public.waitlist_entries FOR INSERT WITH CHECK (true);


--
-- Name: checkout_responses Anyone can submit checkout responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit checkout responses" ON public.checkout_responses FOR INSERT WITH CHECK (true);


--
-- Name: platform_fees Anyone can update platform fees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update platform fees" ON public.platform_fees FOR UPDATE USING (true);


--
-- Name: user_subscriptions Anyone can update subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update subscriptions" ON public.user_subscriptions FOR UPDATE USING (true);


--
-- Name: transactions Anyone can update transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update transactions" ON public.transactions FOR UPDATE USING (true);


--
-- Name: payment_links Anyone can view active payment links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active payment links" ON public.payment_links FOR SELECT USING ((is_active = true));


--
-- Name: subscription_plans Anyone can view active plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active plans" ON public.subscription_plans FOR SELECT USING ((is_active = true));


--
-- Name: tracking_links Anyone can view active tracking links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active tracking links" ON public.tracking_links FOR SELECT USING ((is_active = true));


--
-- Name: user_subscriptions Anyone can view subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view subscriptions" ON public.user_subscriptions FOR SELECT USING (true);


--
-- Name: tracking_events Anyone can view tracking events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view tracking events" ON public.tracking_events FOR SELECT USING (true);


--
-- Name: transactions Anyone can view transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view transactions" ON public.transactions FOR SELECT USING (true);


--
-- Name: withdrawals Merchants can create own withdrawals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can create own withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (true);


--
-- Name: notifications Merchants can delete own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can delete own notifications" ON public.notifications FOR DELETE USING ((merchant_id IN ( SELECT merchants.id
   FROM public.merchants
  WHERE (merchants.pi_user_id = (auth.uid())::text))));


--
-- Name: api_keys Merchants can manage own API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can manage own API keys" ON public.api_keys USING (true);


--
-- Name: payment_links Merchants can manage own payment links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can manage own payment links" ON public.payment_links USING (true);


--
-- Name: tracking_links Merchants can manage own tracking links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can manage own tracking links" ON public.tracking_links USING (true);


--
-- Name: webhooks Merchants can manage own webhooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can manage own webhooks" ON public.webhooks USING (true);


--
-- Name: notifications Merchants can update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can update own notifications" ON public.notifications FOR UPDATE USING ((merchant_id IN ( SELECT merchants.id
   FROM public.merchants
  WHERE (merchants.pi_user_id = (auth.uid())::text))));


--
-- Name: merchants Merchants can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can update own profile" ON public.merchants FOR UPDATE USING (true);


--
-- Name: withdrawals Merchants can update own withdrawals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can update own withdrawals" ON public.withdrawals FOR UPDATE USING (true);


--
-- Name: checkout_responses Merchants can view checkout responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can view checkout responses" ON public.checkout_responses FOR SELECT USING ((payment_link_id IN ( SELECT payment_links.id
   FROM public.payment_links
  WHERE (payment_links.merchant_id IN ( SELECT merchants.id
           FROM public.merchants
          WHERE (merchants.pi_user_id = (auth.uid())::text))))));


--
-- Name: ad_rewards Merchants can view own ad rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can view own ad rewards" ON public.ad_rewards FOR SELECT USING ((merchant_id IN ( SELECT merchants.id
   FROM public.merchants
  WHERE (merchants.pi_user_id = (auth.uid())::text))));


--
-- Name: notifications Merchants can view own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can view own notifications" ON public.notifications FOR SELECT USING ((merchant_id IN ( SELECT merchants.id
   FROM public.merchants
  WHERE (merchants.pi_user_id = (auth.uid())::text))));


--
-- Name: platform_fees Merchants can view own platform fees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can view own platform fees" ON public.platform_fees FOR SELECT USING (true);


--
-- Name: merchants Merchants can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can view own profile" ON public.merchants FOR SELECT USING (true);


--
-- Name: withdrawals Merchants can view own withdrawals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can view own withdrawals" ON public.withdrawals FOR SELECT USING (true);


--
-- Name: waitlist_entries Merchants can view their waitlist entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Merchants can view their waitlist entries" ON public.waitlist_entries FOR SELECT USING ((payment_link_id IN ( SELECT payment_links.id
   FROM public.payment_links
  WHERE (payment_links.merchant_id IN ( SELECT merchants.id
           FROM public.merchants
          WHERE (merchants.pi_user_id = (auth.uid())::text))))));


--
-- Name: ad_rewards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ad_rewards ENABLE ROW LEVEL SECURITY;

--
-- Name: api_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: checkout_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.checkout_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: merchants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_links; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_fees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_fees ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: tracking_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

--
-- Name: tracking_links; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: waitlist_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: webhooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

--
-- Name: withdrawals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;