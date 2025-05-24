import { ApiDataFetcher } from "./apiDataSaver.js";

// const WebSocket = require("ws");
// const colors = require("colors");

function formatHashRate(hashRate) {
  const B = (n) => n.toFixed(2);
  const A = hashRate;
  if (A < 1000) {
    return `${B(A)} B/s`;
  }
  if (A < 10000000) {
    return `${B(A / 1000)} KB/s`;
  }
  if (A < 10000000000) {
    return `${B(A / 1000000)} MB/s`;
  }
  return `${B(A / 1000000000)} GB/s`;
}

/**
 * Fetches miners' information from a given URL and returns formatted data.
 * @param {string} walletAddress - The URL to fetch miners' data from.
 */
async function showMinersInfo(walletAddress) {
  const fetcher = new ApiDataFetcher({
    // url: "https://zpool.ca/api/get_wallet_ex/rM5GziBWoT9y4DQaiacGahTvKZze2TpzrB",
    url: `https://zpool.ca/api/get_wallet_ex/${walletAddress}`,

    filePath: "miners.json",
  });
  const data = await fetcher.fetch();
  // const jsonData = JSON.parse(data);
  const miners = data.miners?.map((miner) => {
      return {
        ...miner,
        password: miner.password.split(",")[0],
      };
    }) ?? [];
   const usersName = infos?.map((ele) => ele.user) ?? [];

  const existedMiners = [
    ...new Set(
      miners
        ?.filter((ele) => usersName.includes(ele.password))
        ?.map((miner) => {
          return {
            name: miner.password.split(",")[0],
            hashRate: formatHashRate(miner.accepted),
            accepted: miner.accepted,
          };
        }) ?? []
    ),
  ];

  const totalHashRateExistMiners = existedMiners.reduce((acc, miner) => {
    const hashRate = parseFloat(miner.accepted);
    return acc + (isNaN(hashRate) ? 0 : hashRate);
  }, 0);

  const totalHashRate = formatHashRate(
    miners.reduce((acc, miner) => {
      const hashRate = parseFloat(miner.accepted);
      return acc + (isNaN(hashRate) ? 0 : hashRate);
    }, 0)
  );
  // console.log(
  //   `Total hash rate: ${colors.green(formatHashRate(totalHashRate))}`
  // );
  // console.log(`Total miners: ${colors.green(miners.length)}`);
  // console.log("----------------------------------------");
  // console.log(`Existed miners: ${colors.green(existedMiners.length)}`);
  // console.table(existedMiners);
  return { existedMiners, miners, totalHashRate, totalHashRateExistMiners: formatHashRate(totalHashRateExistMiners) };
}

/**
 * WebSocketClient class for connecting to a WebSocket server, sending commands, and handling responses.
 */
class WebSocketClient {
  indexOfClient = null;
  userName = null;
  url = null;
  socket = null;
  isConnected = false;
  options = null;

  /**
   * @param {number} indexOfClient - Index of the client
   * @param {string} url - WebSocket server URL (e.g., https://example.com or ws://localhost:9000)
   * @param {string} userName - User name for the connection
   * @param {Object} [options] - Optional configuration
   * @param {Object} [options.headers] - Custom headers for WebSocket connection
   * @param {Function} [options.onMessage] - Custom message handler
   */
  constructor(url, indexOfClient, userName, options = {}) {
    if (!url || typeof url !== "string") {
      throw new Error("Invalid or missing URL");
    }

    this.indexOfClient = indexOfClient || 0;
    this.userName = userName || "defaultUser";
    this.url = WebSocketClient.normalizeUrl(url);
    this.options = {
      headers: {
        Host: WebSocketClient.extractHost(this.url),
        Origin: WebSocketClient.toOrigin(this.url),
        "User-Agent": "Node.js WebSocket Client",
        ...options.headers,
      },
      onMessage: options.onMessage || this.defaultMessageHandler,
    };
    this.socket = null;
    this.isConnected = false;
  }

  /**
   * Normalizes URL to WebSocket protocol (ws:// or wss://).
   * @param {string} url
   * @returns {string}
   */
  static normalizeUrl(url) {
    try {
      if (url.startsWith("https://")) return url.replace("https://", "wss://");
      if (url.startsWith("http://")) return url.replace("http://", "ws://");
      if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
        return `ws://${url}`;
      }
      return url;
    } catch (error) {
      throw new Error(`Invalid URL format: ${error.message}`);
    }
  }

  /**
   * Extracts host from URL (e.g., wss://example.com:9000 -> example.com:9000).
   * @param {string} url
   * @returns {string}
   */
  static extractHost(url) {
    try {
      const { hostname, port } = new URL(url);
      return port ? `${hostname}:${port}` : hostname;
    } catch (error) {
      throw new Error(`Failed to extract host: ${error.message}`);
    }
  }

  /**
   * Converts WebSocket URL to HTTP origin (e.g., wss://example.com -> https://example.com).
   * @param {string} url
   * @returns {string}
   */
  static toOrigin(url) {
    try {
      return url
        .replace(/^wss:\/\//, "https://")
        .replace(/^ws:\/\//, "http://");
    } catch (error) {
      throw new Error(`Failed to generate origin: ${error.message}`);
    }
  }

  /**
   * Connects to the WebSocket server.
   */
  connect() {
    try {
      this.socket = new WebSocket(this.url, [], {
        headers: this.options.headers,
      });

      this.socket.on("open", () => this.handleOpen());
      this.socket.on("message", (data) => this.options.onMessage(data));
      this.socket.on("error", (error) => this.handleError(error));
      this.socket.on("close", (event) => this.handleClose(event));
    } catch (error) {
      console.error(`Connection failed: ${error.message}`);
    }
  }

  /**
   * Sends a message to the server.
   * @param {string} message
   */
  send(message) {
    if (!this.isConnected || !this.socket) {
      console.error("Cannot send message: Not connected");
      return;
    }
    try {
      this.socket.send(message);
      console.log(`Sent: ${message}`);
    } catch (error) {
      console.error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Closes the WebSocket connection.
   */
  close() {
    if (this.socket) {
      this.socket.close();
    }
  }

  /**
   * Handles connection open event.
   */
  handleOpen() {
    // setInterval(() => {
    //   if (this.socket.readyState === WebSocket.OPEN) {
    //     this.send("ping");
    //   }
    // }, 30000); // Ping every 30 seconds

    this.isConnected = true;
    console.log("----------------------------");
    // console.log(`Index ${colors.green(this.indexOfClient)}`);
    // console.log(`Connected to ${colors.green(this.userName)}`);
    // console.log(`Url ${colors.green(this.url)}`);
    this.send("./start.sh 8"); // Example command, configurable via options
  }

  /**
   * Default message handler.
   * @param {Buffer|string} data
   */
  defaultMessageHandler(data) {
    const message = data.toString(); // Convert Buffer to string if needed
    // console.log(
    //   `${new Date().toLocaleString()} - Received: ${colors.green(message)}`
    // );
    return message;
  }

  /**
   * Handles error event.
   * @param {Error} error
   */
  handleError(error) {
    console.error(`Error: ${error.message}`);
  }

  /**
   * Handles close event.
   * @param {Object} event
   */
  handleClose(event) {
    this.isConnected = false;
    console.log(`Connection closed: ${new Date().toLocaleString()}`);
    console.log(
      `Disconnected: Code ${event.code || event}, Reason: ${
        event.reason || "None"
      }`
    );
  }
}

/**
 * Reads miners from the infoMiners file and returns a list of unique miner usernames.
 * @returns {string[]} Array of unique miner usernames.
 */
async function getExistedMiners() {
  const fetcher = new ApiDataFetcher({
    url: "https://zpool.ca/api/get_wallet_ex/rM5GziBWoT9y4DQaiacGahTvKZze2TpzrB",
    filePath: "miners.json",
  });
  const data = await fetcher.fetchInfo();
  const jsonData = JSON.parse(data);
  const minersFromFile = jsonData.miners.map((miner) => {
    return miner.password.split(",")[0];
  });
  return [...new Set(minersFromFile)];
}

/**
 * Creates and connects multiple WebSocket clients.
 * @param {Object[]} infos - Array of connection info objects.
 *   Each object should have:
 *     - {string} url: The WebSocket server URL.
 *     - {string} user: The user name for the connection.
 * @param {Object} [options] - Optional configuration for clients.
 */
function createAndConnectClients(infos, options = {}) {
  if (!Array.isArray(infos) || infos.length === 0) {
    console.error("No URLs provided");
    return;
  }

  const existedMiners = getExistedMiners();
  console.log("Existed miners: ", existedMiners);

  infos
    .filter((ele) => !existedMiners.includes(ele.user))
    .forEach((info, idx) => {
      try {
        const client = new WebSocketClient(info.url, idx, info.user, options);
        client.connect();
      } catch (error) {
        console.error(
          `Failed to create client for ${info.url}: ${error.message}`
        );
      }
    });
}

const infos = [
  {
    user: "taumin576-native",
    url: "https://9000-firebase-native-1746975785276.cluster-ys234awlzbhwoxmkkse6qo3fz6.cloudworkstations.dev",
  },
  {
    user: "taumin576-native-1",
    url: "https://9000-firebase-native-1-1748059789126.cluster-ikxjzjhlifcwuroomfkjrx437g.cloudworkstations.dev",
  },
  // {
  // user: "taumin576-glb",
  // url: "https://9000-idx-glb-1736694186636.cluster-nx3nmmkbnfe54q3dd4pfbgilpc.cloudworkstations.dev",
  // },
  {
    user: "taumin576-express",
    url: "https://9000-firebase-express-1747646758435.cluster-73qgvk7hjjadkrjeyexca5ivva.cloudworkstations.dev",
  },
  {
    user: "asd1115111501-reactk",
    url: "https://9000-firebase-reactk-1746978403992.cluster-zkm2jrwbnbd4awuedc2alqxrpk.cloudworkstations.dev",
  },
  {
    user: "asd1115111501-node",
    url: "https://9000-firebase-node-1747243548052.cluster-ubrd2huk7jh6otbgyei4h62ope.cloudworkstations.dev",
  },
  {
    user: "asd1115111501-reacttkk",
    url: "https://9000-firebase-reacttkk-1748744782732.cluster-fkltigo73ncaixtmokrzxhwsfc.cloudworkstations.dev",
  },
  {
    user: "taumino17-react",
    url: "https://9000-firebase-react-1746978230954.cluster-6dx7corvpngoivimwvvljgokdw.cloudworkstations.dev",
  },
  {
    user: "taumino17-react-1",
    url: "https://9000-firebase-react-1-1748440744694.cluster-zkm2jrwbnbd4awuedc2alqxrpk.cloudworkstations.dev",
  },
  {
    user: "yta865976-navief",
    url: "https://9000-firebase-navief-1746978142275.cluster-6dx7corvpngoivimwvvljgokdw.cloudworkstations.dev",
  },
  {
    user: "yta865976-reactexpo",
    url: "https://9000-firebase-react-expo-1747989289860.cluster-bg6uurscprhn6qxr6xwtrhvkf6.cloudworkstations.dev",
  },
  {
    user: "yta865976-demo-pong",
    url: "https://9000-firebase-demo-pong-1749009921844.cluster-73qgvk7hjjadkrjeyexca5ivva.cloudworkstations.dev",
  },
  {
    user: "yta865976-fllue",
    url: "https://9000-firebase-fllue-1748676898752.cluster-zumahodzirciuujpqvsniawo3o.cloudworkstations.dev",
  },
  {
    user: "satluc-react",
    url: "https://9000-firebase-react-1748226956499.cluster-bg6uurscprhn6qxr6xwtrhvkf6.cloudworkstations.dev",
    // url: "https://9000-firebase-react-1746932474208.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev",
  },
  {
    user: "satluc-reactj",
    url: "https://9000-firebase-reactj-1748744503883.cluster-xpmcxs2fjnhg6xvn446ubtgpio.cloudworkstations.dev",
  },
  {
    user: "satluc-flutter",
    url: "https://9000-firebase-flutter-1748182510501.cluster-zumahodzirciuujpqvsniawo3o.cloudworkstations.dev",
  },
  {
    user: "tan089975-redv",
    url: "https://9000-idx-redv-1745138189848.cluster-w5vd22whf5gmav2vgkomwtc4go.cloudworkstations.dev",
  },
  {
    user: "tan089975-redv-js",
    url: "https://9000-firebase-redv-js-1748132942650.cluster-zumahodzirciuujpqvsniawo3o.cloudworkstations.dev",
  },
  {
    user: "minotau06-reactsj",
    url: "https://9000-firebase-reactsf-1746978323785.cluster-nzwlpk54dvagsxetkvxzbvslyi.cloudworkstations.dev",
  },
  {
    user: "minotau06-reactvip",
    url: "https://9000-firebase-reactvip-1748441241868.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev",
  },
  {
    user: "minotau63-reacctjs",
    url: "https://9000-firebase-reacctjs-1746975368446.cluster-ancjwrkgr5dvux4qug5rbzyc2y.cloudworkstations.dev",
  },
  {
    user: "minotau63-reactjs01",
    url: "https://9000-firebase-reactjs01-1748532935366.cluster-73qgvk7hjjadkrjeyexca5ivva.cloudworkstations.dev",
  },
  {
    user: "minotau63-flue",
    url: "https://9000-firebase-flue-1748676642733.cluster-fkltigo73ncaixtmokrzxhwsfc.cloudworkstations.dev",
  },
  {
    user: "taumino04-viows",
    url: "https://9000-firebase-viows-1746978270043.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev",
  },
  {
    user: "taumino04-flutter",
    url: "https://9000-firebase-flutter-1748183191839.cluster-ys234awlzbhwoxmkkse6qo3fz6.cloudworkstations.dev",
  },
  {
    user: "minotau47-readty",
    url: "https://9000-firebase-readty-1746975294359.cluster-ubrd2huk7jh6otbgyei4h62ope.cloudworkstations.dev",
  },
  {
    user: "minotau47-readt1",
    url: "https://9000-firebase-react-1-1747989416669.cluster-xpmcxs2fjnhg6xvn446ubtgpio.cloudworkstations.dev",
  },
  {
    user: "saxlataotest-natv",
    url: "https://9000-firebase-natv-1746977918198.cluster-ys234awlzbhwoxmkkse6qo3fz6.cloudworkstations.dev",
  },
  {
    user: "saxlataotest-react-native",
    url: "https://9000-firebase-react-native-1748132833649.cluster-ancjwrkgr5dvux4qug5rbzyc2y.cloudworkstations.dev",
  },
];

export { WebSocketClient, createAndConnectClients, showMinersInfo, infos };
