// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract VaultManager is ERC721URIStorage, Ownable {
    struct Invoice {
        address sme;
        address token;
        address investor;
        uint256 fundingAmount;
        uint256 repaymentAmount;
        uint256 dueDate;
        string metadataURI;
        bool isPaid;
        bool isFunded;
    }

    mapping(uint256 => Invoice) public invoices;
    uint256 internal nextTokenId;

    event InvoiceMinted(uint256 indexed nftId, address indexed sme, string metadataURI);
    event InvoiceFunded(uint256 indexed nftId, address indexed investor, uint256 amount);
    event InvoiceRepaid(uint256 indexed nftId, address indexed sme, address indexed investor, uint256 amount);

    constructor(address initialOwner)
        ERC721("InvoiceNFT", "INVOICE")
        Ownable(initialOwner)
    {}

    function mintInvoice(
        address token,
        uint256 fundingAmount,
        uint256 repaymentAmount,
        uint256 dueDate,
        string memory metadataURI
    ) external returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        invoices[tokenId] = Invoice({
            sme: msg.sender,
            token: token,
            investor: address(0),
            fundingAmount: fundingAmount,
            repaymentAmount: repaymentAmount,
            dueDate: dueDate,
            metadataURI: metadataURI,
            isPaid: false,
            isFunded: false
        });

        emit InvoiceMinted(tokenId, msg.sender, metadataURI);
        return tokenId;
    }

    function fundInvoice(uint256 tokenId) external {
        Invoice storage inv = invoices[tokenId];
        require(!inv.isFunded, "Invoice already funded");
        require(inv.sme != address(0), "Invalid invoice");
        require(inv.token != address(0), "Token not set");

        IERC20 token = IERC20(inv.token);
        require(token.transferFrom(msg.sender, inv.sme, inv.fundingAmount), "Funding transfer failed");

        inv.investor = msg.sender;
        inv.isFunded = true;

        emit InvoiceFunded(tokenId, msg.sender, inv.fundingAmount);
    }

    function repayInvoice(uint256 tokenId) external {
        Invoice storage inv = invoices[tokenId];
        require(!inv.isPaid, "Already repaid");
        require(inv.isFunded, "Invoice not yet funded");
        require(msg.sender == inv.sme, "Only SME can repay");
        require(inv.investor != address(0), "No investor");

        IERC20 token = IERC20(inv.token);
        require(token.transferFrom(msg.sender, address(this), inv.repaymentAmount), "Transfer to contract failed");
        require(token.transfer(inv.investor, inv.repaymentAmount), "Forwarding to investor failed");

        inv.isPaid = true;

        emit InvoiceRepaid(tokenId, msg.sender, inv.investor, inv.repaymentAmount);
    }

    function cancelInvoice(uint256 tokenId) external {
        Invoice storage inv = invoices[tokenId];
        require(msg.sender == inv.sme, "Only SME can cancel");
        require(!inv.isFunded, "Invoice already funded");

        _burn(tokenId);
        delete invoices[tokenId];
    }

    function getInvoice(uint256 nftId) external view returns (Invoice memory) {
        require(_exists(nftId), "Invoice does not exist");
        return invoices[nftId];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId);
        require(!invoices[tokenId].isFunded, "Funded invoice cannot be transferred");
    }
}
