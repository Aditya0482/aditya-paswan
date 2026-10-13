import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, CheckCircle2 } from 'lucide-react';

const cryptoWallets = [
  { name: 'Bitcoin (BTC)', symbol: 'BTC', address: 'bc1qnwa99e7ayh8d2x9tt7k5puupw7hnk2rz3775en', color: '#F7931A', imageSrc: '/bitcoin.jpeg' },
  { name: 'Ethereum (ETH)', symbol: 'ETH', address: '0x5f82B145Ea983598f736b8aA66a281cA9eB20956', color: '#627EEA', imageSrc: '/ethereum.jpeg' },
  { name: 'Binance (BNB)', symbol: 'BNB', address: '0x5f82B145Ea983598f736b8aA66a281cA9eB20956', color: '#F3BA2F', imageSrc: '/binance.jpeg' },
  { name: 'Solana (SOL)', symbol: 'SOL', address: '3WPPuveSWEgCCRhwxpnkUh4bayKsSd3qMkD3SJxKymmQ', color: '#14F195', imageSrc: '/solana.jpeg' },
  { name: 'USDT', symbol: 'USDT', address: '0x5f82B145Ea983598f736b8aA66a281cA9eB20956', color: '#26A17B', imageSrc: '/usdt.jpeg' },
  { name: 'Ripple (XRP)', symbol: 'XRP', address: 'rN1NgLSd1DG48TqLnBLrMmu9SVx3YLsfCG', color: '#FFFFFF', imageSrc: '/ripple.jpeg' },
];

export function CryptoPayment() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <section id="crypto" className="py-24 bg-white/[0.02]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 inline-block border-b-4 border-yellow-500 pb-2">
            Support <span className="text-yellow-500">My Work</span>
          </h2>
          <p className="text-gray-400">Support my projects and help me build more, I accept crypto payments for support and project work🚀.......!!</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cryptoWallets.map((wallet, index) => (
            <motion.div
              key={wallet.symbol}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 flex flex-col items-center text-center group"
            >
              <div className="mb-6 w-full h-48 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] transform group-hover:scale-[1.08] transition-transform overflow-hidden bg-black/20 border border-white/5 flex items-center justify-center">
                <img 
                  src={wallet.imageSrc} 
                  alt={`${wallet.name} QR Code`}
                  className="w-full h-full object-contain scale-[1.35]"
                />
              </div>
              
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: wallet.color }}></span>
                {wallet.name}
              </h3>
              
              <div className="w-full mt-4 flex items-center bg-black/40 rounded-lg p-2 border border-white/10">
                <p className="text-xs text-gray-400 font-mono truncate flex-grow text-left px-2">
                  {wallet.address}
                </p>
                <button
                  onClick={() => handleCopy(wallet.address)}
                  className="p-2 hover:bg-white/10 rounded-md transition-colors text-gray-300 hover:text-white"
                  title="Copy Address"
                >
                  {copiedAddress === wallet.address ? (
                    <CheckCircle2 size={16} className="text-yellow-400" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
