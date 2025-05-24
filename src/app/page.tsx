"use client";

import { useActionState } from "react";

import { getInfoMiners } from "./actions";
import StatsCards from "@/components/StatsCard";
import MinersList from "@/components/MinerList";
import { Miner } from "@/components/MinerItem";

interface IStats {
  [key: string]: unknown;
}
interface IState {
  info?: {
    stats?: IStats;
    miners?: unknown[];
  };
  errors?: {
    wallet?: string | string[];
  };
}

const initialState: IState = {};

export default function Home() {
  const [state, formAction, pending] = useActionState(
    getInfoMiners,
    initialState
  );

  const resetForm = () => {
    window.location.reload()
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-6 py-8 max-w-screen-xl">
        {!state?.info?.stats ? (
          <form
            action={formAction}
            id="myForm"
            name="myForm"
            className="mx-auto max-w-xl sm:mt-20"
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="mt-2.5">
                  <input
                    type="text"
                    name="wallet"
                    id="wallet"
                    placeholder="Wallet address"
                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                  />
                </div>
                <p className="mt-1 text-sm text-red-500" id="error-message">
                  {state?.errors?.wallet || ""}
                </p>
              </div>
            </div>
            <div className="mt-10">
              <button
                type="submit"
                className="block w-full rounded-md bg-blue-600 px-3.5 py-2.5 text-center font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                disabled={pending}
              >
                Let&apos;s go
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="mb-8 flex items-center gap-3">
              <span className="mb-5" onClick={() => resetForm()}>
                <svg
                  width="40px"
                  height="40px"
                  viewBox="0 0 16 16"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                  <path
                    fill="#fff"
                    d="M8 1.4l-2 1.3v-1.7h-2v3l-4 2.6 0.6 0.8 7.4-4.8 7.4 4.8 0.6-0.8z"
                  ></path>
                  <path fill="#fff" d="M8 4l-6 4v7h5v-3h2v3h5v-7z"></path>
                </svg>
              </span>

              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Dashboard
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
              </div>
            </div>

            {/* Stats card */}
            <StatsCards
              stats={{
                totalHashRate: String(
                  (state?.info?.stats as { totalHashRate?: unknown })
                    ?.totalHashRate ?? 0
                ),
                totalMiners: String(
                  (state?.info?.stats as { totalMiners?: unknown })
                    ?.totalMiners ?? 0
                ),
                activeMiners: String(
                  (state?.info?.stats as { activeMiners?: unknown })
                    ?.activeMiners ?? 0
                ),
                totalHashRateExistMiners: String(
                  (state?.info?.stats as { totalHashRateExistMiners?: unknown })
                    ?.totalHashRateExistMiners ?? 0
                ),
              }}
            />

            <MinersList
              miners={(state?.info?.miners as Miner[]) || []} // Ensure miners is an array, even if empty
            />
          </div>
        )}
      </div>
    </div>
  );
}
