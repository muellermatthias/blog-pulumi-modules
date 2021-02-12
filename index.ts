import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure";

export class MyComponent extends pulumi.ComponentResource {
    connectionString: pulumi.Output<string>;

    constructor(name: string, props: myInterface, opts?: pulumi.ComponentResourceOptions) {
        super("my-module:azure:storage-account", name, {}, opts);

        const account = new azure.storage.Account(name, {
            resourceGroupName: props.resourcegroupName,
            accountTier: props.accountTier || "Standard",
            accountReplicationType: props.accountReplicationType || "LRS",
        }, {
            parent: this,
        });

        this.connectionString = account.primaryConnectionString;

        if (props.enableNetworkRule) {
            new azure.storage.AccountNetworkRules(name, {
                defaultAction: "Deny",
                resourceGroupName: account.resourceGroupName,
                storageAccountName: account.name,
                ipRules: props.ipList,
            }, {
                parent: this,
            })
        }
    }
}

interface myInterface {

    /**
     * Name of an existing resource group for the storage account.
     */
    resourcegroupName: pulumi.Input<string>

    /**
     * Defines the tier to use for this storage account.
     * Valid options are `Standard` and `Premium`.
     *
     * Defaults to **Standard**.
     */
    accountTier?: string

    /**
     * Defines the type of replication to use for this storage account.
     * Valid options are `LRS`, `GRS`, `RAGRS`, `ZRS`, `GZRS` and `RAGZRS`.
     *
     * Defaults to **LRS**.
     */
    accountReplicationType?: string

    /**
     * Whether or not the Deny network rule for the storage account should be added.
     *
     * Defaults to **false**.
     */
    enableNetworkRule?: boolean

    /**
     * List of public IP or IP ranges in CIDR Format, which should have access.
     *
     * Can only be set if *enableNetworkRule* is true.
     *
     * Defaults to **[]**.
     */
    ipList?: string[]
}